const Scene = require('./base')
const { getImageUrl } = require('../utils/assets')
const { preloadSfx } = require('../utils/audio')

/**
 * 加载场景
 * 负责预加载游戏资源，显示加载进度
 */
class LoadingScene extends Scene {
  constructor() {
    super()
    this.progress = 0
    this.targetProgress = 0
    this.loaded = false
    this.onComplete = null  // 加载完成回调
    this.bgImg = null
    this.titleImg = null
  }

  onEnter() {
    this.progress = 0
    this.targetProgress = 0
    this.loaded = false

    // 加载背景图
    const bg = wx.createImage()
    bg.src = getImageUrl('loading/bgs/loading_bg01.png')
    bg.onload = () => { this.bgImg = bg }

    // 加载标题图
    const title = wx.createImage()
    title.src = getImageUrl('loading/titles/title.png')
    title.onload = () => { this.titleImg = title }

    this._loadResources()
  }

  _loadResources() {
    // 预加载全部图片资源：菜单 + 游戏 + 道具 + 弹窗 + 排行榜
    // 加载后微信会自动缓存到本地临时目录，后续场景直接使用缓存，避免首次显示时的空白/闪烁
    const images = [
      // 菜单场景
      getImageUrl('menu/bgs/menu_bg01.png'),
      getImageUrl('menu/buttons/button_start.png'),
      getImageUrl('menu/buttons/button_rank.png'),
      getImageUrl('menu/titles/title.png'),
      getImageUrl('menu/elements/animal_left.png'),
      getImageUrl('menu/elements/animal_right.png'),
      // 游戏场景
      getImageUrl('game/bgs/game_bg01.png'),
      getImageUrl('game/cards/slots.png'),
      // 道具图标
      getImageUrl('game/props/moveOut.png'),
      getImageUrl('game/props/peek.png'),
      getImageUrl('game/props/shuffle.png'),
      getImageUrl('game/props/undo.png'),
      // 胜利弹窗背景
      getImageUrl('game/dialogs/win/bg.png'),
      // 排行榜奖牌
      getImageUrl('rank/medals/first.png'),
      getImageUrl('rank/medals/second.png'),
      getImageUrl('rank/medals/third.png'),
    ]
    // 18 张动物卡面
    for (let i = 1; i <= 18; i++) {
      images.push(getImageUrl('game/cards/animals/' + i + '.png'))
    }

    // 总任务数 = 图片数 + 音效数（SFX_KEYS 共 4 个，这里硬编码简化，实际用 keys 数更稳）
    const audioKeys = ['click', 'merge', 'defeat', 'success']
    const totalCount = images.length + audioKeys.length
    let loadedCount = 0

    if (totalCount === 0) {
      this.targetProgress = 100
      return
    }

    const tick = () => {
      loadedCount++
      this.targetProgress = Math.floor((loadedCount / totalCount) * 100)
    }

    // 保留 Image 引用，防止被 GC 导致缓存失效
    this._preloadImages = []
    images.forEach(src => {
      const img = wx.createImage()
      this._preloadImages.push(img)
      img.onload = tick
      img.onerror = () => {
        console.warn('[loading] 图片加载失败:', src)
        tick()
      }
      img.src = src
    })

    // 预热音效（触发 CDN 下载 + 写入 audio.js 的 _sfxCache，首次 playSfx 即命中）
    preloadSfx(() => tick())
  }

  update(dt) {
    if (this.progress < this.targetProgress) {
      this.progress = Math.min(this.progress + 2, this.targetProgress)
    }
    if (this.progress >= 100 && !this.loaded) {
      this.loaded = true
      if (this.onComplete) this.onComplete()
    }
  }

  render() {
    const { ctx, width, height } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, width, height)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'

    // 标题：优先用图片，未加载好时临时显示文字兑底
    if (this.titleImg) {
      const titleW = width * 0.6
      const titleH = titleW * (this.titleImg.height / this.titleImg.width)
      ctx.drawImage(this.titleImg, (width - titleW) / 2, height / 2 - 60 - titleH, titleW, titleH)
    } else {
      ctx.fillText('牛马日记', width / 2, height / 2 - 60)
    }

    const barWidth = width * 0.6
    const barHeight = 12
    const barX = (width - barWidth) / 2
    const barY = height / 2 + 20

    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = '#4ecca3'
    ctx.fillRect(barX, barY, barWidth * (this.progress / 100), barHeight)

    ctx.fillStyle = '#aaaaaa'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('加载中... ' + this.progress + '%', width / 2, barY + 40)
  }
}

module.exports = LoadingScene

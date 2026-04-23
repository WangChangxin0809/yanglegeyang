const Scene = require('./base')

/**
 * 主菜单场景
 * 显示游戏标题和功能按钮
 */
class MenuScene extends Scene {
  constructor() {
    super()
    this.startBtn = null
    this.startImg = null
    this.bgImg = null
    this.titleImg = null
    this.titleTimer = 0
  }

  onEnter() {
    // 加载标题图片
    const titleImg = wx.createImage()
    titleImg.src = 'images/menu/title.png'
    titleImg.onload = () => { this.titleImg = titleImg }

    const btnWidth = this.width * 0.5
    const btnHeight = 60

    this.startBtn = {
      text: '开始游戏',
      x: (this.width - btnWidth) / 2,
      y: this.height * 0.75,
      width: btnWidth,
      height: btnHeight,
      action: 'start'
    }

    // 加载背景图
    const bg = wx.createImage()
    bg.src = 'images/menu/bgs/menu_bg01.png'
    bg.onload = () => { this.bgImg = bg }

    // 加载按钮图片
    const img = wx.createImage()
    img.src = 'images/menu/buttons/button_start.png'
    img.onload = () => {
      this.startImg = img
      const ratio = img.width / img.height
      this.startBtn.height = this.startBtn.width / ratio
      this.startBtn.x = (this.width - this.startBtn.width) / 2
      this.startBtn.y = this.height * 0.75
    }
    img.onerror = () => {
      this.startImg = null
    }
  }

  onTouchStart(x, y) {
    const btn = this.startBtn
    if (btn && x >= btn.x && x <= btn.x + btn.width &&
        y >= btn.y && y <= btn.y + btn.height) {
      console.log('点击了: 开始游戏')
      if (this.onStartGame) this.onStartGame()
    }
  }

  update(dt) {
    this.titleTimer += dt
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

    // 标题图片
    if (this.titleImg) {
      const imgRatio = this.titleImg.width / this.titleImg.height
      const titleW = width * 0.98
      const titleH = titleW / imgRatio
      const titleCX = width / 2
      const titleCY = height * 0.36

      const angle = Math.sin(this.titleTimer / 800) * 0.06

      ctx.save()
      ctx.translate(titleCX, titleCY)
      ctx.rotate(angle)
      ctx.drawImage(this.titleImg, -titleW / 2, -titleH / 2, titleW, titleH)
      ctx.restore()
    }

    // 开始游戏按钮
    const btn = this.startBtn
    const scale = 1 + Math.sin(this.titleTimer / 500) * 0.06
    const btnCX = btn.x + btn.width / 2
    const btnCY = btn.y + btn.height / 2

    ctx.save()
    ctx.translate(btnCX, btnCY)
    ctx.scale(scale, scale)

    if (this.startImg) {
      ctx.drawImage(this.startImg, -btn.width / 2, -btn.height / 2, btn.width, btn.height)
    } else {
      ctx.beginPath()
      const r = 10
      const bx = -btn.width / 2
      const by = -btn.height / 2
      ctx.moveTo(bx + r, by)
      ctx.arcTo(bx + btn.width, by, bx + btn.width, by + btn.height, r)
      ctx.arcTo(bx + btn.width, by + btn.height, bx, by + btn.height, r)
      ctx.arcTo(bx, by + btn.height, bx, by, r)
      ctx.arcTo(bx, by, bx + btn.width, by, r)
      ctx.closePath()
      ctx.fillStyle = '#4ecca3'
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(btn.text, 0, 0)
    }
    ctx.restore()
  }
}

module.exports = MenuScene

const Scene = require('./base')
const { get } = require('../utils/request')

/**
 * 排行榜场景
 * 展示各关卡通关时间排名
 */

// 屏幕比例参数
const HEADER_H       = 0.10   // 顶部栏高度
const TAB_H           = 0.06   // 关卡 Tab 高度
const ROW_H           = 0.07   // 每行高度
const SIDE_PAD        = 0.05   // 左右内边距
const AVATAR_SIZE     = 0.06   // 头像尺寸
const FONT_TITLE      = 0.05   // 标题字号
const FONT_TAB        = 0.035  // Tab 字号
const FONT_ROW        = 0.033  // 行内字号
const FONT_RANK       = 0.04   // 排名字号
const SCROLL_FRICTION = 0.95   // 滚动摩擦系数

class RankScene extends Scene {
  constructor() {
    super()
    this.rankData = []
    this.loading = false
    this.currentLevel = 1
    this.maxLevel = 2
    this.scrollY = 0        // 滚动偏移
    this.scrollVelocity = 0 // 滚动速度
    this.lastTouchY = 0
    this.isDragging = false
    this.onBack = null
  }

  onEnter() {
    this.currentLevel = 1
    this.scrollY = 0
    this.scrollVelocity = 0
    this._fetchRank()
  }

  _fetchRank() {
    this.loading = true
    this.rankData = []
    this.scrollY = 0

    get('/api/record/rank?level_id=' + this.currentLevel + '&limit=50')
      .then((data) => {
        this.rankData = data || []
        this.loading = false
        console.log('[rank] 获取排行榜, 关卡:', this.currentLevel, '条数:', this.rankData.length)
      })
      .catch((err) => {
        console.warn('[rank] 获取排行榜失败:', err)
        this.loading = false
      })
  }

  onTouchStart(x, y) {
    const w = this.width
    const h = this.height

    // 返回按钮
    const backSize = Math.round(w * 0.09)
    const backX = w * 0.03
    const backY = h * 0.02
    if (x >= backX && x <= backX + backSize && y >= backY && y <= backY + backSize) {
      if (this.onBack) this.onBack()
      return
    }

    // 关卡 Tab 切换
    const tabY = h * HEADER_H
    const tabH = h * TAB_H
    if (y >= tabY && y <= tabY + tabH) {
      const tabW = w / this.maxLevel
      const clickedLevel = Math.floor(x / tabW) + 1
      if (clickedLevel !== this.currentLevel && clickedLevel >= 1 && clickedLevel <= this.maxLevel) {
        this.currentLevel = clickedLevel
        this._fetchRank()
      }
      return
    }

    // 开始拖拽滚动
    this.isDragging = true
    this.lastTouchY = y
    this.scrollVelocity = 0
  }

  onTouchMove(x, y) {
    if (!this.isDragging) return
    const dy = y - this.lastTouchY
    this.scrollY += dy
    this.scrollVelocity = dy
    this.lastTouchY = y
  }

  onTouchEnd(x, y) {
    this.isDragging = false
  }

  update(dt) {
    // 惯性滚动
    if (!this.isDragging && Math.abs(this.scrollVelocity) > 0.5) {
      this.scrollY += this.scrollVelocity
      this.scrollVelocity *= SCROLL_FRICTION
    } else if (!this.isDragging) {
      this.scrollVelocity = 0
    }

    // 边界限制
    const contentH = this.rankData.length * this.height * ROW_H
    const listH = this.height * (1 - HEADER_H - TAB_H)
    const maxScroll = 0
    const minScroll = Math.min(0, listH - contentH - this.height * 0.02)
    this.scrollY = Math.max(minScroll, Math.min(maxScroll, this.scrollY))
  }

  render() {
    const { ctx, width: w, height: h } = this

    // 背景
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, w, h)

    // ===== 顶部栏 =====
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, w, h * HEADER_H)

    // 返回按钮
    const backSize = Math.round(w * 0.09)
    const backX = w * 0.03
    const backY = h * 0.02
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.arc(backX + backSize / 2, backY + backSize / 2, backSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const cx = backX + backSize / 2
    const cy = backY + backSize / 2
    const ar = backSize * 0.22
    ctx.beginPath()
    ctx.moveTo(cx + ar * 0.3, cy - ar)
    ctx.lineTo(cx - ar * 0.7, cy)
    ctx.lineTo(cx + ar * 0.3, cy + ar)
    ctx.stroke()
    ctx.restore()

    // 标题
    ctx.fillStyle = '#ffffff'
    const titleSize = Math.round(w * FONT_TITLE)
    ctx.font = 'bold ' + titleSize + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('排行榜', w / 2, h * HEADER_H / 2)

    // ===== 关卡 Tab =====
    const tabY = h * HEADER_H
    const tabH = h * TAB_H
    const tabW = w / this.maxLevel
    const tabFont = Math.round(w * FONT_TAB)

    for (let i = 1; i <= this.maxLevel; i++) {
      const tx = (i - 1) * tabW
      const isActive = i === this.currentLevel

      ctx.fillStyle = isActive ? '#4ecca3' : 'rgba(255,255,255,0.08)'
      ctx.fillRect(tx, tabY, tabW, tabH)

      // 底部高亮条
      if (isActive) {
        ctx.fillStyle = '#00b894'
        ctx.fillRect(tx + tabW * 0.2, tabY + tabH - 3, tabW * 0.6, 3)
      }

      ctx.fillStyle = isActive ? '#ffffff' : '#aaaaaa'
      ctx.font = (isActive ? 'bold ' : '') + tabFont + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('第' + i + '关', tx + tabW / 2, tabY + tabH / 2)
    }

    // ===== 列表区域 =====
    const listTop = tabY + tabH
    const listH = h - listTop

    // 裁剪区域
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, listTop, w, listH)
    ctx.clip()

    if (this.loading) {
      ctx.fillStyle = '#888888'
      ctx.font = Math.round(w * FONT_ROW) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('加载中...', w / 2, listTop + listH / 2)
    } else if (this.rankData.length === 0) {
      ctx.fillStyle = '#888888'
      ctx.font = Math.round(w * FONT_ROW) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('暂无通关记录', w / 2, listTop + listH / 2)
    } else {
      const rowH = h * ROW_H
      const padX = w * SIDE_PAD
      const rankFont = Math.round(w * FONT_RANK)
      const rowFont = Math.round(w * FONT_ROW)
      const avatarS = w * AVATAR_SIZE

      for (let i = 0; i < this.rankData.length; i++) {
        const item = this.rankData[i]
        const ry = listTop + i * rowH + this.scrollY

        // 跳过不可见行
        if (ry + rowH < listTop || ry > h) continue

        // 行背景（交替色）
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'
        ctx.fillRect(0, ry, w, rowH)

        // 排名
        const rankCx = padX + rankFont * 0.6
        const rowCy = ry + rowH / 2

        if (item.rank <= 3) {
          // 前三名金银铜
          const medals = ['#FFD700', '#C0C0C0', '#CD7F32']
          ctx.fillStyle = medals[item.rank - 1]
          ctx.beginPath()
          ctx.arc(rankCx, rowCy, rankFont * 0.55, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#1a1a2e'
        } else {
          ctx.fillStyle = '#888888'
        }
        ctx.font = 'bold ' + rankFont + 'px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.rank, rankCx, rowCy)

        // 头像占位圆
        const avatarX = padX + rankFont * 1.5
        const avatarY = rowCy - avatarS / 2
        ctx.fillStyle = '#4ecca3'
        ctx.beginPath()
        ctx.arc(avatarX + avatarS / 2, rowCy, avatarS / 2, 0, Math.PI * 2)
        ctx.fill()
        // 头像首字
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold ' + Math.round(avatarS * 0.5) + 'px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const initial = (item.nickname || '?')[0]
        ctx.fillText(initial, avatarX + avatarS / 2, rowCy)

        // 昵称
        const nameX = avatarX + avatarS + w * 0.03
        ctx.fillStyle = '#ffffff'
        ctx.font = rowFont + 'px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        const name = item.nickname.length > 8 ? item.nickname.substring(0, 8) + '...' : item.nickname
        ctx.fillText(name, nameX, rowCy)

        // 通关时间
        const timeStr = item.best_time.toFixed(1) + 's'
        ctx.fillStyle = '#4ecca3'
        ctx.font = 'bold ' + rowFont + 'px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(timeStr, w - padX, rowCy)
      }
    }

    ctx.restore()

    // 当前用户标记（如果在榜上）
    if (GameGlobal.userInfo && this.rankData.length > 0) {
      const myRank = this.rankData.find(r => r.user_id === GameGlobal.userInfo.id)
      if (myRank) {
        ctx.fillStyle = 'rgba(78, 204, 163, 0.9)'
        const tipFont = Math.round(w * 0.03)
        ctx.font = tipFont + 'px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText('你的排名: 第' + myRank.rank + '名  最快: ' + myRank.best_time.toFixed(1) + 's', w / 2, h - h * 0.02)
      }
    }
  }
}

module.exports = RankScene

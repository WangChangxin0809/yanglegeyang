const Scene = require('./base')
const { getImageUrl } = require('../utils/assets')
const { authorize } = require('../utils/request')

/**
 * 授权登录场景（进入游戏的前置关卡）
 * - 用户必须点击"微信授权登录"按钮完成授权，才能进入菜单
 * - 未授权时无法进入游戏（参考金毛大战波斯猫的 login scene 模式）
 */
class AuthScene extends Scene {
  constructor() {
    super()
    this.onComplete = null   // 授权成功回调（由 game.js 设置）
    this.bgImg = null
    this.titleImg = null
    this.titleTimer = 0
    this.loginBtn = null     // 原生 wx.createUserInfoButton 实例
    this.loginBtnArea = null // 按钮碰撞区（仅用于 render 占位对齐）
    this.loading = false     // 授权请求中
    this.errorMsg = ''       // 失败提示
  }

  onEnter() {
    this.titleTimer = 0
    this.loading = false
    this.errorMsg = ''

    // 加载背景
    const bg = wx.createImage()
    bg.src = getImageUrl('loading/bgs/loading_bg01.png')
    bg.onload = () => { this.bgImg = bg }

    // 加载标题
    const title = wx.createImage()
    title.src = getImageUrl('menu/titles/title.png')
    title.onload = () => { this.titleImg = title }

    this._registerPrivacyHandler()
    this._createLoginButton()
  }

  /**
   * 注册隐私授权弹窗处理
   * 微信 2023-09-15 后：调用 wx.login / UserInfoButton.onTap 等前
   * 若公众平台已声明隐私指引但用户尚未同意，会触发 onNeedPrivacyAuthorization
   */
  _registerPrivacyHandler() {
    if (this._privacyRegistered) return
    if (typeof wx.onNeedPrivacyAuthorization !== 'function') return
    wx.onNeedPrivacyAuthorization((resolve) => {
      wx.showModal({
        title: '隐私协议',
        content: '我们将获取你的微信昵称和头像，用于排行榜展示与玩家身份识别。详情见《用户隐私保护指引》。',
        confirmText: '同意',
        cancelText: '拒绝',
        success: (res) => {
          if (res.confirm) {
            resolve({ event: 'agree', buttonId: 'agree-btn' })
          } else {
            resolve({ event: 'disagree' })
            this.errorMsg = '需同意隐私协议才能开始游戏'
          }
        },
        fail: () => {
          resolve({ event: 'disagree' })
        }
      })
    })
    this._privacyRegistered = true
  }

  onExit() {
    this._destroyLoginButton()
  }

  _destroyLoginButton() {
    if (this.loginBtn) {
      try { this.loginBtn.destroy() } catch (e) { /* ignore */ }
      this.loginBtn = null
    }
  }

  /** 创建微信授权按钮（原生覆盖在 canvas 上） */
  _createLoginButton() {
    this._destroyLoginButton()

    const w = this.width
    const h = this.height
    const btnW = Math.round(w * 0.6)
    const btnH = Math.round(h * 0.075)
    const btnX = Math.round((w - btnW) / 2)
    const btnY = Math.round(h * 0.68)
    this.loginBtnArea = { x: btnX, y: btnY, width: btnW, height: btnH }

    if (typeof wx.createUserInfoButton !== 'function') return

    this.loginBtn = wx.createUserInfoButton({
      type: 'text',
      text: '微信授权登录',
      style: {
        left: btnX,
        top: btnY,
        width: btnW,
        height: btnH,
        backgroundColor: '#07C160',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: Math.round(btnH * 0.38),
        borderRadius: Math.round(btnH / 2),
        lineHeight: btnH
      },
      withCredentials: false,
      lang: 'zh_CN'
    })

    this.loginBtn.onTap((res) => {
      if (!res || !res.userInfo) {
        this.errorMsg = '您拒绝了授权，需授权后才能开始游戏'
        return
      }
      this._doAuthorize(res.userInfo)
    })
  }

  /** 调用 authorize：wx.login 换 token + 回填昵称/头像 */
  _doAuthorize(userInfo) {
    if (this.loading) return
    this.loading = true
    this.errorMsg = ''

    authorize({
      nickname: userInfo.nickName,
      avatar_url: userInfo.avatarUrl
    })
      .then(() => {
        console.log('[auth] 授权登录成功:', userInfo.nickName)
        this._destroyLoginButton()
        if (this.onComplete) this.onComplete()
      })
      .catch((err) => {
        console.warn('[auth] 授权登录失败', err)
        this.errorMsg = '登录失败，请重试：' + (err && err.message ? err.message : '')
        this.loading = false
      })
  }

  update(dt) {
    this.titleTimer += dt
  }

  render() {
    const { ctx, width: w, height: h } = this

    // 背景
    if (this.bgImg) {
      ctx.drawImage(this.bgImg, 0, 0, w, h)
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, 0, w, h)
    } else {
      // 兜底：渐变背景
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#1a237e')
      grad.addColorStop(1, '#1b5e20')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    // 标题图片（带轻微摇摆）
    if (this.titleImg) {
      const ratio = this.titleImg.width / this.titleImg.height
      const titleW = w * 0.85
      const titleH = titleW / ratio
      const cx = w / 2
      const cy = h * 0.3
      const angle = Math.sin(this.titleTimer / 800) * 0.04
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.drawImage(this.titleImg, -titleW / 2, -titleH / 2, titleW, titleH)
      ctx.restore()
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold ' + Math.round(w * 0.09) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('牛马日记', w / 2, h * 0.3)
    }

    // 提示文案
    ctx.fillStyle = '#ffffff'
    ctx.font = Math.round(w * 0.04) + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('请先授权微信登录以开始游戏', w / 2, h * 0.55)

    // 授权中遮罩
    if (this.loading) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold ' + Math.round(w * 0.05) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('登录中...', w / 2, h / 2)
    }

    // 错误提示（按钮下方）
    if (this.errorMsg && this.loginBtnArea) {
      ctx.fillStyle = '#ff6b6b'
      ctx.font = Math.round(w * 0.033) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(this.errorMsg, w / 2, this.loginBtnArea.y + this.loginBtnArea.height + 12)
    }
  }
}

module.exports = AuthScene

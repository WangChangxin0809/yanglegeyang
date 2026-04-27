require('./global')

const LoadingScene = require('./scenes/loading')
const MenuScene = require('./scenes/menu')
const GameScene = require('./scenes/game')
const RankScene = require('./scenes/rank')
const { login } = require('./utils/request')

// 初始化画布
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')
const windowInfo = wx.getWindowInfo()
const deviceInfo = wx.getDeviceInfo()
const dpr = windowInfo.pixelRatio || deviceInfo.pixelRatio || 1

// 高清屏适配：canvas 实际帧缓冲按物理像素（screenWidth * DPR），
// 代码绘制时通过 ctx.scale(DPR) 继续用逻辑像素坐标，场景代码 0 修改。
canvas.width = windowInfo.screenWidth * dpr
canvas.height = windowInfo.screenHeight * dpr
ctx.scale(dpr, dpr)

// 存入全局
GameGlobal.canvas = canvas
GameGlobal.ctx = ctx
GameGlobal.screenWidth = windowInfo.screenWidth
GameGlobal.screenHeight = windowInfo.screenHeight
GameGlobal.pixelRatio = dpr
// ==================== 场景管理 ====================
let currentScene = null

function switchScene(scene) {
  if (currentScene && currentScene.onExit) currentScene.onExit()
  currentScene = scene
  if (currentScene && currentScene.onEnter) currentScene.onEnter()
}

// 创建场景实例
const loadingScene = new LoadingScene()
const menuScene = new MenuScene()
const gameScene = new GameScene()
const rankScene = new RankScene()

// 场景跳转链接
loadingScene.onComplete = () => {
  // 加载完成后自动登录
  login()
    .then((data) => {
      GameGlobal.token = data.token
      GameGlobal.userInfo = { id: data.user_id, nickname: data.nickname, avatar_url: data.avatar_url }
      console.log('[login] 登录成功，用户:', data.nickname || data.user_id)
    })
    .catch((err) => {
      console.warn('[login] 登录失败，离线模式运行', err)
    })
    .finally(() => {
      switchScene(menuScene)
    })
}
menuScene.onStartGame = () => switchScene(gameScene)
menuScene.onRank = () => switchScene(rankScene)
gameScene.onBack = () => switchScene(menuScene)
rankScene.onBack = () => switchScene(menuScene)

// ==================== 触摸事件 ====================
wx.onTouchStart((e) => {
  const touch = e.touches[0]
  if (currentScene && currentScene.onTouchStart) {
    currentScene.onTouchStart(touch.clientX, touch.clientY)
  }
})

wx.onTouchMove((e) => {
  const touch = e.touches[0]
  if (currentScene && currentScene.onTouchMove) {
    currentScene.onTouchMove(touch.clientX, touch.clientY)
  }
})

wx.onTouchEnd((e) => {
  const touch = e.changedTouches[0]
  if (currentScene && currentScene.onTouchEnd) {
    currentScene.onTouchEnd(touch.clientX, touch.clientY)
  }
})

// ==================== 游戏主循环 ====================
let lastTime = Date.now()

function gameLoop() {
  const now = Date.now()
  const dt = now - lastTime
  lastTime = now

  if (currentScene) {
    if (currentScene.update) currentScene.update(dt)
    if (currentScene.render) currentScene.render()
  }

  requestAnimationFrame(gameLoop)
}

// 启动
switchScene(loadingScene)
requestAnimationFrame(gameLoop)

require('./global')

const LoadingScene = require('./scenes/loading')
const AuthScene = require('./scenes/auth')
const MenuScene = require('./scenes/menu')
const GameScene = require('./scenes/game')
const RankScene = require('./scenes/rank')
const { restoreAuth } = require('./utils/request')
const { pauseBgm, resumeBgm } = require('./utils/audio')

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
const authScene = new AuthScene()
const menuScene = new MenuScene()
const gameScene = new GameScene()
const rankScene = new RankScene()

// 启动时先尝试从本地 storage 恢复 token/userInfo
restoreAuth()

// 判断是否已授权（token + 非空昵称/头像）
function isAuthorized() {
  const info = GameGlobal.userInfo
  return !!(GameGlobal.token && info && info.nickname && info.avatar_url)
}

// 场景跳转链接
loadingScene.onComplete = () => {
  // 本地已授权 → 直接进菜单；否则 → 强制进入授权场景
  if (isAuthorized()) {
    switchScene(menuScene)
  } else {
    switchScene(authScene)
  }
}
authScene.onComplete = () => switchScene(menuScene)
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

// 前后台切换：后台暂停 BGM，回前台恢复
wx.onShow(() => { resumeBgm() })
wx.onHide(() => { pauseBgm() })

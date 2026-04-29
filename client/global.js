/**
 * 全局变量初始化
 * 在 game.js 最开始引入，统一管理全局状态
 */

// 画布相关
GameGlobal.canvas = null
GameGlobal.ctx = null

// 屏幕信息
GameGlobal.screenWidth = 0
GameGlobal.screenHeight = 0
GameGlobal.pixelRatio = 1

// 服务器配置
// 线上域名（多游戏共用 game.yunque.co，通过路径前缀 /hustle 区分）
GameGlobal.serverUrl = 'https://game.yunque.co/hustle'
// 本地调试
// GameGlobal.serverUrl = 'http://127.0.0.1:8089'

// 用户信息
GameGlobal.token = ''
GameGlobal.userInfo = null

// 游戏状态
GameGlobal.currentLevel = 1
GameGlobal.score = 0

// 设置
GameGlobal.settings = {
  sound: true,
  music: true
}

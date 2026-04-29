/**
 * 网络请求工具
 * 封装 wx.request()，自动添加 token 和 baseUrl
 */

const TOKEN_STORAGE_KEY = 'hd_token'
const USER_STORAGE_KEY = 'hd_user_info'

/**
 * 发起 HTTP 请求
 * @param {string} path - API 路径，如 '/api/auth/login'
 * @param {object} options - { method, data }
 * @returns {Promise<object>} - 解析后的响应 data
 */
function request(path, options = {}) {
  const { method = 'GET', data = null } = options
  const url = GameGlobal.serverUrl + path

  const header = { 'Content-Type': 'application/json' }
  if (GameGlobal.token) {
    header['Authorization'] = 'Bearer ' + GameGlobal.token
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          resolve(res.data.data)
        } else {
          const msg = (res.data && res.data.message) || '请求失败'
          console.error('[request]', method, path, msg)
          reject(new Error(msg))
        }
      },
      fail(err) {
        console.error('[request] 网络错误', method, path, err)
        reject(err)
      }
    })
  })
}

/** POST 请求 */
function post(path, data) {
  return request(path, { method: 'POST', data: data })
}

/** GET 请求 */
function get(path) {
  return request(path, { method: 'GET' })
}

/**
 * 微信登录（wx.login → /api/auth/login 换 token）
 * 成功后 token + userInfo 会写入 GameGlobal 与本地 storage
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          return reject(new Error('wx.login 未返回 code'))
        }
        post('/api/auth/login', { code: loginRes.code })
          .then((data) => {
            saveAuth(data.token, {
              id: data.user_id,
              nickname: data.nickname,
              avatar_url: data.avatar_url,
            })
            resolve(data)
          })
          .catch(reject)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/**
 * 上传微信授权后的昵称/头像
 * @param {{nickname:string, avatar_url:string}} profile
 */
function updateProfile(profile) {
  return post('/api/auth/update-profile', {
    nickname: profile.nickname || '',
    avatar_url: profile.avatar_url || '',
  }).then((data) => {
    // 同步更新全局与本地存储
    const userInfo = Object.assign({}, GameGlobal.userInfo, {
      nickname: data.nickname,
      avatar_url: data.avatar_url,
    })
    GameGlobal.userInfo = userInfo
    try {
      wx.setStorageSync(USER_STORAGE_KEY, userInfo)
    } catch (e) { /* ignore */ }
    return data
  })
}

/** 将 token + userInfo 写入 GameGlobal 与本地 storage */
function saveAuth(token, userInfo) {
  GameGlobal.token = token || ''
  GameGlobal.userInfo = userInfo || null
  try {
    if (token) wx.setStorageSync(TOKEN_STORAGE_KEY, token)
    if (userInfo) wx.setStorageSync(USER_STORAGE_KEY, userInfo)
  } catch (e) { /* ignore */ }
}

/** 从本地 storage 读取 token + userInfo 注入 GameGlobal（启动时调用一次） */
function restoreAuth() {
  try {
    const token = wx.getStorageSync(TOKEN_STORAGE_KEY)
    const userInfo = wx.getStorageSync(USER_STORAGE_KEY)
    if (token) GameGlobal.token = token
    if (userInfo) GameGlobal.userInfo = userInfo
  } catch (e) { /* ignore */ }
}

/** 清除登录态（登出 / token 失效时调用） */
function clearAuth() {
  GameGlobal.token = ''
  GameGlobal.userInfo = null
  try {
    wx.removeStorageSync(TOKEN_STORAGE_KEY)
    wx.removeStorageSync(USER_STORAGE_KEY)
  } catch (e) { /* ignore */ }
}

/**
 * 一站式授权：wx.login 换 token → update-profile 回填昵称头像
 * 用于 auth 场景的授权按钮完整流程。
 * @param {{nickname:string, avatar_url:string}} profile 微信授权返回的 userInfo
 */
function authorize(profile) {
  return login().then(() => updateProfile(profile || {}))
}

module.exports = { request, post, get, login, updateProfile, authorize, restoreAuth, clearAuth }

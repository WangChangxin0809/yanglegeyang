/**
 * 网络请求工具
 * 封装 wx.request()，自动添加 token 和 baseUrl
 */

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
 * 登录（开发模式自动选择 dev-login，正式模式走微信登录）
 */
function login() {
  return new Promise((resolve, reject) => {
    // 先尝试微信登录
    wx.login({
      success(loginRes) {
        if (loginRes.code) {
          // 有 code → 走正式登录
          post('/api/auth/login', { code: loginRes.code })
            .then(resolve)
            .catch(() => {
              // 正式登录失败 → 降级为开发模式登录
              console.log('[login] 微信登录失败，降级为开发模式登录')
              post('/api/auth/dev-login')
                .then(resolve)
                .catch(reject)
            })
        } else {
          // 无 code → 直接走开发模式
          post('/api/auth/dev-login')
            .then(resolve)
            .catch(reject)
        }
      },
      fail() {
        // wx.login 失败 → 走开发模式
        post('/api/auth/dev-login')
          .then(resolve)
          .catch(reject)
      }
    })
  })
}

module.exports = { request, post, get, login }

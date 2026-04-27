/**
 * 图片资源路径中心
 *
 * 所有场景通过 getImageUrl(relPath) 引用图片，不再硬编码 'images/xxx.png'。
 * 切换 USE_REMOTE_ASSETS 即可一键切换 本地 / OSS 远程。
 *
 * 用法：
 *   const { getImageUrl } = require('../utils/assets')
 *   img.src = getImageUrl('menu/titles/title.png')
 *
 * 相对路径以 client/images/ 为根，不要以 / 开头。
 * 远程 URL 需在微信公众平台的 downloadFile 合法域名白名单中（或开发者工具勾选"不校验域名"）。
 */

// 是否使用远程 OSS 资源（false 则读本地 client/images/）
// 开发调试：可改为 false 纯离线跑；上线前保持 true
const USE_REMOTE_ASSETS = true

// OSS 资源 CDN 根（与 scripts/oss_upload/upload.py 的 OSS_PREFIX + bucket 保持一致）
const REMOTE_BASE = 'https://yanglegeyang-assets.oss-cn-shanghai.aliyuncs.com/v1/images'

// 本地资源根（相对小游戏包根目录）
const LOCAL_BASE = 'images'

/**
 * 根据相对路径生成可直接赋给 Image.src 的完整 URL。
 * @param {string} relPath 相对 images/ 的路径，如 'game/cards/animals/1.png'
 * @returns {string}
 */
function getImageUrl(relPath) {
  const base = USE_REMOTE_ASSETS ? REMOTE_BASE : LOCAL_BASE
  return base + '/' + relPath
}

module.exports = {
  getImageUrl,
  USE_REMOTE_ASSETS,
}

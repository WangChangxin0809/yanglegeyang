/**
 * 弹窗模块统一入口
 *
 * 根据 dialog.type 自动分发到对应子模块的 render / hit。
 *
 * 支持的 type：
 *   'confirm' - 确认弹窗（退出、二次确认）
 *   'revive'  - 复活弹窗
 *
 * 用法：
 *   const dialogs = require('./dialogs')
 *   dialogs.renderDialog(ctx, config, this.dialog)
 *   dialogs.hitDialog(x, y, config, this.dialog)
 */

const confirm = require('./confirm')
const revive = require('./revive')

const MODULES = {
  confirm: confirm,
  revive: revive,
}

/**
 * 绘制弹窗（根据 dialog.type 分发）
 * @param {CanvasRenderingContext2D} ctx
 * @param {{width:number,height:number}} config
 * @param {Object} dialog - 必须含 type 字段
 */
function renderDialog(ctx, config, dialog) {
  const mod = MODULES[dialog.type]
  if (mod) {
    mod.render(ctx, config, dialog)
  } else {
    // 兼容：无 type 时走 confirm
    confirm.render(ctx, config, dialog)
  }
}

/**
 * 命中检测（根据 dialog.type 分发）
 * @param {number} x
 * @param {number} y
 * @param {{width:number,height:number}} config
 * @param {Object} dialog - 必须含 type 字段
 * @returns {'confirm'|'cancel'|'outside'|null}
 */
function hitDialog(x, y, config, dialog) {
  const mod = MODULES[dialog.type]
  if (mod) {
    return mod.hit(x, y, config)
  }
  // 兼容：无 type 时走 confirm
  return confirm.hit(x, y, config)
}

module.exports = { renderDialog, hitDialog }

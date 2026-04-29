/**
 * 游戏渲染模块统一入口
 *
 * 按职责分类：
 *   cards      - 棋盘卡牌（图片预加载 + 绘制）
 *   slots      - 底部槽位
 *   props      - 道具按钮
 *   background - 关卡背景
 *   backButton - 左上角返回按钮
 *   title      - 关卡标题
 *   flyAnim    - 卡牌飞向槽位的动画
 *   matchFx    - 三消闪光特效
 *   particles  - 粒子（爆发/礼花）
 *   toast      - 屏幕提示
 *   endFx      - 结算全屏特效
 *
 * 用法：
 *   const renders = require('./renders')
 *   renders.preloadAll()               // 关卡开始预加载所有素材
 *   renders.cards.renderCards(ctx, ...) // 分类调用
 */

const cards = require('./cards')
const slots = require('./slots')
const props = require('./props')
const background = require('./background')
const backButton = require('./backButton')
const title = require('./title')
const flyAnim = require('./flyAnim')
const matchFx = require('./matchFx')
const particles = require('./particles')
const toast = require('./toast')
const endFx = require('./endFx')

/** 一次性预加载所有需要图片的渲染模块 */
function preloadAll() {
  cards.preload()
  slots.preload()
  props.preload()
  background.load()
}

module.exports = {
  cards,
  slots,
  props,
  background,
  backButton,
  title,
  flyAnim,
  matchFx,
  particles,
  toast,
  endFx,
  preloadAll,
}

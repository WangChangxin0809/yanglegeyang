/**
 * 道具模块汇总入口
 *
 * 按索引对应道具区按钮顺序：
 *   0 - 移出（moveOut）
 *   1 - 撤回（undo）
 *   2 - 洗牌（shuffle）
 *   3 - 透视（peek）
 *
 * 用法：
 *   const props = require('./props')
 *   props.init()              // 关卡开始时重置次数
 *   props.getCount(i)         // 取剩余次数（用于渲染角标）
 *   const r = props.use(i, s) // 使用道具，成功会自动扣 1 次
 */

const moveOut = require('./moveOut')
const undo = require('./undo')
const shuffle = require('./shuffle')
const peek = require('./peek')

const PROPS = [moveOut, undo, shuffle, peek]

// 默认次数：移出/撤回/洗牌/透视
const DEFAULT_LIMITS = [3, 3, 3, 3]

// 当前剩余次数
let counts = DEFAULT_LIMITS.slice()

// 记录每个道具是否已通过分享增加过次数（关卡内有效）
let shared = PROPS.map(() => false)

/**
 * 重置各道具次数
 * @param {number[]} [limits] - 可选，自定义 4 个道具的次数；缺省用默认值
 */
function init(limits) {
  if (limits && limits.length === PROPS.length) {
    counts = limits.slice()
  } else {
    counts = DEFAULT_LIMITS.slice()
  }
  // 关卡重置时同步清空分享记录
  shared = PROPS.map(() => false)
}

/** 获取指定道具剩余次数 */
function getCount(index) {
  return counts[index] == null ? 0 : counts[index]
}

/** 给指定道具增加次数 */
function addCount(index, amount) {
  if (index >= 0 && index < PROPS.length) {
    counts[index] = (counts[index] || 0) + (amount || 1)
  }
}

/** 查询某道具是否可通过分享解锁（次数为0且未分享过） */
function canShare(index) {
  if (index < 0 || index >= PROPS.length) return false
  return getCount(index) <= 0 && !shared[index]
}

/** 查询某道具是否已经分享解锁过 */
function hasShared(index) {
  if (index < 0 || index >= PROPS.length) return false
  return !!shared[index]
}

/**
 * 标记某道具已通过分享解锁（应在分享成功回调中调用）
 * @param {number} index - 道具索引
 * @param {number} [amount=1] - 解锁后增加的次数
 */
function markShared(index, amount) {
  if (index < 0 || index >= PROPS.length) return false
  if (shared[index]) return false
  shared[index] = true
  addCount(index, amount || 1)
  console.log('[道具] 分享解锁: index=' + index + ' 剩余=' + counts[index])
  return true
}

/**
 * 使用指定道具
 * @param {number} index - 道具索引 0/1/2/3
 * @param {Object} state - 游戏状态 { cards, slots, history }
 * @returns {boolean|string} true=成功，'peek'=进入透视选择模式，字符串=失败原因
 */
function use(index, state) {
  if (index < 0 || index >= PROPS.length) return '无效道具'
  if (counts[index] <= 0) {
    // 次数为 0 时，如果该道具尚未分享过，则触发分享解锁流程
    if (!shared[index]) {
      console.log('[道具] 次数为0，触发分享解锁: index=' + index)
      return 'share'
    }
    console.log('[道具] 次数已用完: index=' + index)
    return '次数已用完'
  }
  const result = PROPS[index].use(state)
  // 成功（true）或进入透视选择模式（'peek'）才扣 1 次
  if (result === true || result === 'peek') {
    counts[index]--
    console.log('[道具] 扣减次数: index=' + index + ' 剩余=' + counts[index])
  }
  return result
}

module.exports = { use, init, getCount, addCount, canShare, hasShared, markShared }

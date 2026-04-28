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
const DEFAULT_LIMITS = [1, 1, 1, 1]

// 当前剩余次数
let counts = DEFAULT_LIMITS.slice()

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
}

/** 获取指定道具剩余次数 */
function getCount(index) {
  return counts[index] == null ? 0 : counts[index]
}

/**
 * 使用指定道具
 * @param {number} index - 道具索引 0/1/2/3
 * @param {Object} state - 游戏状态 { cards, slots, history, stash }
 * @returns {boolean|string} true=成功，'peek'=进入透视选择模式，字符串=失败原因
 */
function use(index, state) {
  if (index < 0 || index >= PROPS.length) return '无效道具'
  if (counts[index] <= 0) {
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

module.exports = { use, init, getCount }

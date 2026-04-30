/**
 * 道具：洗牌
 *
 * 将棋盘上所有未移除的卡牌的图标随机重新分配，
 * 不改变卡牌位置和层级，只换图标。
 * 保证洗牌后每种图标数量不变（仍可消除）。
 */

/** Fisher-Yates 洗牌 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * @param {Object} state - { cards, slots, height }
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
// 移出区起始 y 比例（与 moveOut.js 中 MOVEOUT_Y 保持一致）
const MOVEOUT_Y_RATIO = 0.68

function use(state) {
  const { cards, height } = state

  // 移出区像素阈值：c.y 是绝对像素坐标，不是 0~1 的比例
  const moveOutBaseY = Math.round((height || 0) * MOVEOUT_Y_RATIO)

  // 收集所有未移除且位于棋盘区的卡牌（排除 y 落在移出区的卡牌）
  const remaining = cards.filter(c => !c.removed && c.y < moveOutBaseY)
  if (remaining.length === 0) {
    console.log('[道具] 洗牌：无可洗的卡牌')
    return '无可洗的卡牌'
  }

  // 提取图标并打乱
  const icons = remaining.map(c => c.icon)
  shuffleArray(icons)

  // 重新分配图标
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].icon = icons[i]
  }

  console.log('[道具] 洗牌成功，打乱 ' + remaining.length + ' 张卡牌')
  return true
}

module.exports = { use }

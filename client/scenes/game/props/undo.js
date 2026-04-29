/**
 * 道具：撤回
 *
 * 撤回上一步操作：将最后放入槽位的卡牌
 * 恢复到棋盘原来的位置。
 */

/**
 * @param {Object} state - { cards, slots, history }
 *   history: [{ card, insertIdx? }]
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(state) {
  const { slots, history } = state
  if (!history || history.length === 0) {
    console.log('[道具] 撤回：无可撤回的操作')
    return '无可撤回的操作'
  }

  // 弹出最后一次操作
  const last = history.pop()
  const card = last.card

  // 从槽位中移除该卡牌（找到同图标的最后一张）
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].icon === card.icon) {
      slots.splice(i, 1)
      break
    }
  }

  // 恢复棋盘上的卡牌
  card.removed = false
  console.log('[道具] 撤回成功（回到棋盘）')

  return true
}

module.exports = { use }

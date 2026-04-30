/**
 * 道具：移出
 *
 * 从槽位中取出最多 3 张卡牌，放到卡牌区下方的"移出区"（y > 棋盘底部）。
 * 移出的卡牌作为普通卡牌存在于 cards 数组，可直接点击再次入槽。
 * 槽位为空时不可使用。
 */

// 每次最多移出张数
const MOVE_MAX = 3

// 移出区位置参数（相对屏幕比例）
const MOVEOUT_Y      = 0.68   // 移出区起始 y = 屏幕高度 × 68%（棋盘底部 0.65 下方）
const MOVEOUT_GAP    = 0.15   // 卡牌间距 = 卡牌尺寸 × 15%
const MOVEOUT_ROW_STEP = 0.015 // 每次移出后 y 递增 = 屏幕高度 × 3%（多次使用时新行往下叠）

// 卡牌尺寸（与 gameLogic 中 CARD_SIZE_SCALE 保持一致）
const CARD_SIZE_SCALE = 0.12

/**
 * @param {Object} state - { cards, slots, history, width, height }
 * @returns {boolean|string} true=成功，字符串=失败原因
 */
function use(state) {
  const { cards, slots, width, height } = state

  // 槽位为空，无牌可移
  if (!slots || slots.length === 0) {
    console.log('[道具] 移出：槽位为空')
    return '槽位为空'
  }

  const count = Math.min(MOVE_MAX, slots.length)
  const size = Math.round(width * CARD_SIZE_SCALE)
  const gap = Math.round(size * MOVEOUT_GAP)
  const totalW = count * (size + gap) - gap
  const startX = (width - totalW) / 2
  const baseY = Math.round(height * MOVEOUT_Y)
  const rowStep = Math.round(height * MOVEOUT_ROW_STEP)

  // 扫描棋盘上已有的「移出区卡牌」（y >= baseY 且未被消除），
  // 以最底行为参照，下一行再往下 rowStep。这样每次调用都会堆叠出新一行。
  let maxExistY = -1
  for (const c of cards) {
    if (!c.removed && c.y >= baseY && c.y > maxExistY) maxExistY = c.y
  }
  let posY = maxExistY >= 0 ? maxExistY + rowStep : baseY
  // 保底：不超出屏幕底部
  const maxY = height - size
  if (posY > maxY) posY = maxY

  // 找当前最大 layer，移出卡牌放最高层（不被遮挡）
  let maxLayer = 0
  for (const c of cards) {
    if (c.layer > maxLayer) maxLayer = c.layer
  }

  // 从槽位前端取出卡牌，创建 card 对象放入棋盘
  const moved = slots.splice(0, count)
  for (let i = 0; i < moved.length; i++) {
    cards.push({
      icon: moved[i].icon,
      x: startX + i * (size + gap),
      y: posY,
      width: size,
      height: size,
      layer: maxLayer + 1,
      removed: false
    })
  }

  console.log('[道具] 移出成功，移出 ' + count + ' 张到棋盘下方')
  return true
}

module.exports = { use }

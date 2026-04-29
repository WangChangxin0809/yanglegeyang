/**
 * 游戏逻辑模块
 * 负责：点击检测、槽位管理、三消匹配、输赢判定、卡牌生成、遮挡判定
 */

const LEVELS = require('./levels')

// ==================== 屏幕比例参数（卡牌生成相关） ====================
const BOARD_TOP        = 0.10   // 卡牌区顶部 = 屏幕高度 × 10%（标题下方）
const BOARD_SIDE       = 0.07   // 卡牌区左右边距 = 屏幕宽度 × 7%
const BOARD_BOTTOM     = 0.65   // 卡牌区底部 = 屏幕高度 × 65%
const CARD_SIZE_SCALE  = 0.12   // 卡牌尺寸 = 屏幕宽度 × 12%
const CARD_BLOCKED_THR = 0.1    // 遮挡判定阈值 = 重叠面积 ÷ 卡牌面积

// 卡牌图标种类总数（需与 renders/cards.js 的 ICON_COUNT 保持一致）
const ICON_COUNT = 18

/**
 * 处理触摸事件，找到被点击的可操作卡牌
 * @param {number} x       - 触摸 x 坐标
 * @param {number} y       - 触摸 y 坐标
 * @param {Array}  cards   - 所有卡牌
 * @returns {Object|null}  被点击的卡牌，未命中返回 null
 */
function handleTouch(x, y, cards) {
  // 从最上层开始检测点击
  for (let i = cards.length - 1; i >= 0; i--) {
    const card = cards[i]
    if (card.removed) continue
    if (x >= card.x && x <= card.x + card.width &&
        y >= card.y && y <= card.y + card.height) {
      // 被遮挡的不能点
      if (isBlocked(card, cards)) continue
      return card
    }
  }
  return null
}

/**
 * 将选中的卡牌放入槽位（按点击顺序追加到末尾）
 * @param {Object} card  - 被选中的卡牌
 * @param {Array}  slots - 当前槽位数组（会被原地修改）
 */
function pickCard(card, slots) {
  card.removed = true
  slots.push({ icon: card.icon })
}

/**
 * 检查并消除 3 个相同图标
 * @param {Array} slots - 当前槽位数组
 * @returns {Array} 消除后的新槽位数组
 */
function checkMatch(slots) {
  const counts = {}
  for (const slot of slots) {
    counts[slot.icon] = (counts[slot.icon] || 0) + 1
  }
  let result = slots
  for (const icon in counts) {
    if (counts[icon] >= 3) {
      let removed = 0
      result = result.filter(s => {
        if (s.icon === icon && removed < 3) {
          removed++
          return false
        }
        return true
      })
    }
  }
  return result
}

/**
 * 判断游戏结果
 * @param {Array}  cards    - 所有卡牌
 * @param {Array}  slots    - 当前槽位
 * @param {number} maxSlots - 最大槽位数
 * @returns {{ gameOver: boolean, gameWin: boolean }}
 */
function checkResult(cards, slots, maxSlots) {
  const gameOver = slots.length >= maxSlots
  const gameWin = cards.every(c => c.removed)
  return { gameOver, gameWin }
}

/**
 * 判断卡牌是否被上层遮挡（基于矩形重叠面积）
 * @param {Object} card  - 目标卡牌
 * @param {Array}  cards - 所有卡牌
 * @returns {boolean}
 */
function isBlocked(card, cards) {
  const threshold = card.width * card.height * CARD_BLOCKED_THR
  for (const other of cards) {
    if (other.removed || other.layer <= card.layer) continue
    const overlapX = Math.max(0, Math.min(card.x + card.width, other.x + other.width) - Math.max(card.x, other.x))
    const overlapY = Math.max(0, Math.min(card.y + card.height, other.y + other.height) - Math.max(card.y, other.y))
    if (overlapX * overlapY > threshold) {
      return true
    }
  }
  return false
}

/** 洗牌（Fisher-Yates） */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 根据关卡配置生成卡牌数组
 *
 * 先计算卡牌可用区域（标题下方 → 槽位上方，左右留边距），
 * 然后区域的 x, y 基于可用区域定位（0~1 比例）。
 *
 * 配置层级：
 *   关卡级：iconTypes
 *   区域级：x, y（区域左上角，相对卡牌可用区域的比例 0~1）
 *   层级：  gapRatio、offsetCol、offsetRow、cards
 */
function generateCards(level, screenW, screenH) {
  const levelIdx = Math.min(level - 1, LEVELS.length - 1)
  const cfg = LEVELS[levelIdx]

  // 卡牌尺寸（全局统一）
  const size = Math.round(screenW * CARD_SIZE_SCALE)
  const regions = cfg.regions

  // ---- 计算卡牌可用区域 ----
  const areaTop = screenH * BOARD_TOP
  const areaBottom = screenH * BOARD_BOTTOM
  const areaLeft = screenW * BOARD_SIDE
  const areaRight = screenW * (1 - BOARD_SIDE)
  const areaW = areaRight - areaLeft
  const areaH = areaBottom - areaTop

  // ---- 1. 统计总卡牌数 & 构建卡池 ----
  let totalCards = 0
  for (const region of regions) {
    for (const layerCfg of region.layers) {
      totalCards += layerCfg.cards.length
    }
  }

  // 从 ICON_COUNT 种图标中随机挑选 iconTypes 种
  const allIcons = []
  for (let i = 1; i <= ICON_COUNT; i++) allIcons.push(String(i))
  shuffleArray(allIcons)
  const selectedIcons = allIcons.slice(0, cfg.iconTypes)

  // ---- 随机分配图标组：每 3 张为一组，每组随机指定一种图标 ----
  const groupCount = Math.floor(totalCards / 3)
  const pool = []
  for (let g = 0; g < groupCount; g++) {
    const iconIdx = Math.floor(Math.random() * cfg.iconTypes)
    const icon = selectedIcons[iconIdx]
    pool.push(icon, icon, icon)
  }
  shuffleArray(pool)

  // ---- 2. 逐区域生成卡牌 ----
  const cards = []
  let idx = 0

  for (const region of regions) {
    const originX = areaLeft + areaW * region.x
    const originY = areaTop + areaH * region.y

    for (const layerCfg of region.layers) {
      const gapRatio = layerCfg.gapRatio != null ? layerCfg.gapRatio : 0.12
      const gap = Math.round(size * gapRatio)
      const cellW = size + gap
      const cellH = size + gap
      const offC = layerCfg.offsetCol || 0
      const offR = layerCfg.offsetRow || 0

      for (const pos of layerCfg.cards) {
        if (idx >= pool.length) break
        cards.push({
          icon: pool[idx],
          x: originX + (pos.col + offC) * cellW,
          y: originY + (pos.row + offR) * cellH,
          width: size,
          height: size,
          layer: layerCfg.layer,
          removed: false
        })
        idx++
      }
    }
  }

  return cards
}

module.exports = {
  handleTouch,
  pickCard,
  checkMatch,
  checkResult,
  isBlocked,
  generateCards,
}

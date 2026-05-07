/**
 * 卡牌主题注册表
 *
 * 所有主题资源均位于 images/game/cards/themes/<name>/，图片命名 1.png ~ <iconCount>.png
 * loading 阶段一次性预加载全部主题，每次进入关卡（game._startLevel）随机 pick 一个主题，
 * 渲染时 cards.js / flyAnim.js / matchFx.js / slots.js 都通过 cards.getIconImg() 按当前主题取图。
 *
 * 约束：任一主题的 iconCount 必须 ≥ 最大关卡的 iconTypes，否则 generateCards 会取不到足够图标。
 * 当前：level2.iconTypes = 12，所有主题 iconCount ≥ 14 → 满足。
 */

const THEMES = [
  { name: 'animals',   iconCount: 18 },
  { name: 'beach',     iconCount: 14 },
  { name: 'childhood', iconCount: 14 },
  { name: 'fruits',    iconCount: 14 },
  { name: 'vegetable', iconCount: 14 },
  { name: 'work',      iconCount: 14 },
]

// 默认主题（在随机 pick 之前的兜底）
let _current = THEMES[0]

function getAll() {
  return THEMES
}

function getCurrent() {
  return _current
}

function setCurrent(name) {
  const t = THEMES.find(x => x.name === name)
  if (t) _current = t
  return _current
}

/** 随机选择一个主题并设为当前主题 */
function pickRandom() {
  _current = THEMES[Math.floor(Math.random() * THEMES.length)]
  return _current
}

module.exports = {
  THEMES,
  getAll,
  getCurrent,
  setCurrent,
  pickRandom,
}

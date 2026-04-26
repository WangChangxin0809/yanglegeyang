/**
 * 第二关 - 重新设计
 *
 * 共 3 个区域：
 *   区域 1（左上角）：8 层单卡堆叠，offsetCol 0 → +0.70（向右错位）       8 张
 *   区域 2（右上角）：8 层单卡堆叠，offsetCol 0 → -0.70（镜像对称）        8 张
 *   区域 3（下方大片）：5 层交错堆叠 5×5 / 4×4 / 5×5 / 4×4 / 2×2   86 张
 *   区域 4（左下角）：6 层单卡堆叠，奇偶层 offsetCol 交错 0 / 0.5                6 张
 *   区域 5（右下角）：6 层单卡堆叠，奇偶层 offsetCol 交错 0 / -0.5（与区域 4 镜像）  6 张
 *
 * 总计 8 + 8 + 86 + 6 + 6 = 114 = 6 × 19 × 3 ✓
 */

module.exports = {
  title: '第二关 - 挑战开始',
  iconTypes: 12,
  regions: [
    // ==================== 区域 1：左上角 8 层堆叠（向右错位） ====================
    {
      x: 0.05, y: 0.05,  // 左上角
      layers: [
        { layer: 0, gapRatio: 0.1, offsetCol: 0.00, cards: [{ col: 0, row: 0 }] },
        { layer: 1, gapRatio: 0.1, offsetCol: 0.10, cards: [{ col: 0, row: 0 }] },
        { layer: 2, gapRatio: 0.1, offsetCol: 0.20, cards: [{ col: 0, row: 0 }] },
        { layer: 3, gapRatio: 0.1, offsetCol: 0.30, cards: [{ col: 0, row: 0 }] },
        { layer: 4, gapRatio: 0.1, offsetCol: 0.40, cards: [{ col: 0, row: 0 }] },
        { layer: 5, gapRatio: 0.1, offsetCol: 0.50, cards: [{ col: 0, row: 0 }] },
        { layer: 6, gapRatio: 0.1, offsetCol: 0.60, cards: [{ col: 0, row: 0 }] },
        { layer: 7, gapRatio: 0.1, offsetCol: 0.70, cards: [{ col: 0, row: 0 }] },
      ]
      // 区域 1: 8 张
    },

    // ==================== 区域 2：右上角 8 层堆叠（镜像对称，向左错位） ====================
    {
      x: 0.81, y: 0.05,  // 区域 1 的镜像位置（与左区域在可用区域内左右对称）
      layers: [
        { layer: 0, gapRatio: 0.1, offsetCol:  0.00, cards: [{ col: 0, row: 0 }] },
        { layer: 1, gapRatio: 0.1, offsetCol: -0.10, cards: [{ col: 0, row: 0 }] },
        { layer: 2, gapRatio: 0.1, offsetCol: -0.20, cards: [{ col: 0, row: 0 }] },
        { layer: 3, gapRatio: 0.1, offsetCol: -0.30, cards: [{ col: 0, row: 0 }] },
        { layer: 4, gapRatio: 0.1, offsetCol: -0.40, cards: [{ col: 0, row: 0 }] },
        { layer: 5, gapRatio: 0.1, offsetCol: -0.50, cards: [{ col: 0, row: 0 }] },
        { layer: 6, gapRatio: 0.1, offsetCol: -0.60, cards: [{ col: 0, row: 0 }] },
        { layer: 7, gapRatio: 0.1, offsetCol: -0.70, cards: [{ col: 0, row: 0 }] },
      ]
      // 区域 2: 8 张
    },

    // ==================== 区域 3：下方大片五层交错堆叠 ====================
    {
      x: 0.12, y: 0.22,  // 横向居中，纵向从上区域下方开始
      layers: [
        {
          // 第一层：5×5 = 25 张（底层基座）
          layer: 0, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 },
            { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 },
          ]
        },
        {
          // 第二层：4×4 = 16 张（砂砥交错，卡在底层 4 张交界处）
          layer: 1, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
          ]
        },
        {
          // 第三层：5×5 = 25 张（回归对齐，完全遮罩第二层）
          layer: 2, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 },
            { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 },
          ]
        },
        {
          // 第四层：4×4 = 16 张（再次砂砥交错）
          layer: 3, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
          ]
        },
        {
          // 第五层：2×2 = 4 张（每张正好覆盖第四层 2×2 共 4 张，完全盖住第四层）
          // gapRatio=1.2 让第五层 cellW = 2.2×size，恰好跨越第四层 2 格；offsetCol/Row=0.5 对齐第四层交界中心
          layer: 4, gapRatio: 1.2, offsetCol: 0.5, offsetRow: 0.5,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
      ]
      // 区域 3: 25 + 16 + 25 + 16 + 4 = 86 张
    },

    // ==================== 区域 4：左下角 6 层单卡奇偶交错堆叠 ====================
    {
      x: 0.05, y: 0.85,  // 左下角
      layers: [
        { layer: 0, gapRatio: 0.1, offsetCol: 0.0, cards: [{ col: 0, row: 0 }] },  // 第 1 层（奇）
        { layer: 1, gapRatio: 0.1, offsetCol: 0.5, cards: [{ col: 0, row: 0 }] },  // 第 2 层（偶）
        { layer: 2, gapRatio: 0.1, offsetCol: 0.0, cards: [{ col: 0, row: 0 }] },  // 第 3 层（奇）
        { layer: 3, gapRatio: 0.1, offsetCol: 0.5, cards: [{ col: 0, row: 0 }] },  // 第 4 层（偶）
        { layer: 4, gapRatio: 0.1, offsetCol: 0.0, cards: [{ col: 0, row: 0 }] },  // 第 5 层（奇）
        { layer: 5, gapRatio: 0.1, offsetCol: 0.5, cards: [{ col: 0, row: 0 }] },  // 第 6 层（偶）
      ]
      // 区域 4: 6 张
    },

    // ==================== 区域 5：右下角 6 层单卡奇偶交错堆叠（与区域 4 镜像对称） ====================
    {
      x: 0.81, y: 0.85,  // 区域 4 的镜像位置
      layers: [
        { layer: 0, gapRatio: 0.1, offsetCol:  0.0, cards: [{ col: 0, row: 0 }] },  // 第 1 层（奇）
        { layer: 1, gapRatio: 0.1, offsetCol: -0.5, cards: [{ col: 0, row: 0 }] },  // 第 2 层（偶，向左错位）
        { layer: 2, gapRatio: 0.1, offsetCol:  0.0, cards: [{ col: 0, row: 0 }] },  // 第 3 层（奇）
        { layer: 3, gapRatio: 0.1, offsetCol: -0.5, cards: [{ col: 0, row: 0 }] },  // 第 4 层（偶）
        { layer: 4, gapRatio: 0.1, offsetCol:  0.0, cards: [{ col: 0, row: 0 }] },  // 第 5 层（奇）
        { layer: 5, gapRatio: 0.1, offsetCol: -0.5, cards: [{ col: 0, row: 0 }] },  // 第 6 层（偶）
      ]
      // 区域 5: 6 张
    }
  ]
  // 总计 8 + 8 + 86 + 6 + 6 = 114 = 6 × 19 × 3 ✓
}

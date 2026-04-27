/**
 * 第二关 - 重新设计
 *
 * 共 7 个区域：
 *   区域 1  （左上角） ：8 层单卡堆叠，offsetCol 0 → +0.70（向右错位）             8 张
 *   区域 2  （右上角） ：8 层单卡堆叠，offsetCol 0 → -0.70（与区域 1 镜像）          8 张
 *   区域 3.1（中左侧） ：16 层偶(2×2)/奇(1)交错堆叠，奇数层居中于下方 2×2          40 张
 *   区域 3.2（中右侧） ：与区域 3.1 镜像对称（层结构一致，x 翻到右侧）               40 张
 *   区域 3.3（中间 ） ：24 层环形阶梯（每层 1 张，沿 0/90/180/270°四个方位循环 6 圈）      24 张
 *   区域 3.4（3.3 左侧）：16 层偶(1×2 竖向)/奇(1 居中)交错堆叠               24 张
 *   区域 3.5（3.3 右侧）：与区域 3.4 镜像对称（层结构一致，x 翻到右侧）            24 张
 *   区域 4  （左下角） ：6 层单卡堆叠，奇偶层 offsetCol 交错 0 / 0.5                 6 张
 *   区域 5  （右下角） ：6 层单卡堆叠，奇偶层 offsetCol 交错 0 / -0.5（与区域 4 镜像） 6 张
 *   区域 6  （顶层盖 ） ：layer 50 单层 6×6 大片覆盖 + layer 51 居中 3×3 + layer 52 复刻 6×6 的 row 3/4      57 张
 *
 * 总计 8 + 8 + 40 + 40 + 24 + 24 + 24 + 6 + 6 + 57 = 237 张（237 ÷ 3 = 79，可三消 ✓）
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

    // ==================== 区域 3.1：16 层偶(2×2)/奇(1)交错堆叠（左侧） ====================
    {
      x: 0.12, y: 0.22,  // 中左侧：复用原区域 3 左上锚点
      layers: [
        {
          // 第 1 层（偶）：2×2 = 4 张基座
          layer: 0, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 2 层（奇）：1 张，居中于下方 2×2 四张的几何中心
          layer: 1, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 3 层（偶）：2×2 = 4 张
          layer: 2, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 4 层（奇）：1 张居中
          layer: 3, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 5 层（偶）：2×2 = 4 张
          layer: 4, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 6 层（奇）：1 张居中
          layer: 5, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 7 层（偶）：2×2 = 4 张
          layer: 6, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 8 层（奇）：1 张居中
          layer: 7, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 8 层（偶）：2×2 = 4 张
          layer: 8, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 9 层（奇）：1 张居中
          layer: 9, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 10 层（偶）：2×2 = 4 张
          layer: 10, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 11 层（奇）：1 张居中
          layer: 11, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 12 层（偶）：2×2 = 4 张
          layer: 12, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 13 层（奇）：1 张居中
          layer: 13, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 14 层（偶）：2×2 = 4 张
          layer: 14, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 15 层（奇）：1 张居中
          layer: 15, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
      ]
      // 区域 3.1: 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 + 4 + 1 = 40 张
    },

    // ==================== 区域 3.2：与 3.1 镜像对称（右侧） ====================
    {
      x: 0.54, y: 0.22,  // 中右侧：x 采用与区域 1↔2 相同的镜像约定（0.86 - 0.12 = 0.74），y 保持一致
      layers: [
        {
          // 第 1 层（偶）：2×2 = 4 张基座
          layer: 0, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 2 层（奇）：1 张，居中于下方 2×2 四张的几何中心
          layer: 1, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 3 层（偶）：2×2 = 4 张
          layer: 2, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 4 层（奇）：1 张居中
          layer: 3, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 5 层（偶）：2×2 = 4 张
          layer: 4, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 6 层（奇）：1 张居中
          layer: 5, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 7 层（偶）：2×2 = 4 张
          layer: 6, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 8 层（奇）：1 张居中
          layer: 7, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 8 层（偶）：2×2 = 4 张
          layer: 8, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 9 层（奇）：1 张居中
          layer: 9, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 10 层（偶）：2×2 = 4 张
          layer: 10, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 11 层（奇）：1 张居中
          layer: 11, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 12 层（偶）：2×2 = 4 张
          layer: 12, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 13 层（奇）：1 张居中
          layer: 13, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 14 层（偶）：2×2 = 4 张
          layer: 14, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 },
          ]
        },
        {
          // 第 15 层（奇）：1 张居中
          layer: 15, gapRatio: 0.1, offsetCol: 0.5, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
      ]
      // 区域 3.2: 40 张（与 3.1 结构完全一致，层数翻倍至 16 层）
    },

    // ==================== 区域 3.3：24 层环形阶梯（每层 1 张沿四方位循环） ====================
    // 原理：每层单卡 {col:0,row:0}，通过 offsetCol/offsetRow 将卡片中心放在半径 R=0.5 cell 的圆周上，
    // 仅使用 0°/90°/180°/270° 四个正方位，24 层顺时针循环 6 圈 → 四个方位各堆叠 6 张，
    // 视觉上成“十字型六层阶梯”。
    {
      x: 0.345, y: 0.52,  // 画面中部偏下
      layers: [
        { layer:  0, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 1 圈）
        { layer:  1, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer:  2, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer:  3, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
        { layer:  4, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 2 圈）
        { layer:  5, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer:  6, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer:  7, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
        { layer:  8, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 3 圈）
        { layer:  9, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer: 10, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer: 11, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
        { layer: 12, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 4 圈）
        { layer: 13, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer: 14, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer: 15, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
        { layer: 16, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 5 圈）
        { layer: 17, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer: 18, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer: 19, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
        { layer: 20, gapRatio: 0.1, offsetCol: 1.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, //   0° 东（第 6 圈）
        { layer: 21, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 1.000, cards: [{ col: 0, row: 0 }] }, //  90° 南
        { layer: 22, gapRatio: 0.1, offsetCol: 0.000, offsetRow: 0.500, cards: [{ col: 0, row: 0 }] }, // 180° 西
        { layer: 23, gapRatio: 0.1, offsetCol: 0.500, offsetRow: 0.000, cards: [{ col: 0, row: 0 }] }, // 270° 北
      ]
      // 区域 3.3: 24 张（四个方位 × 6 圈）
    },

    // ==================== 区域 3.4：3.3 左侧竖向堆叠（偶 1×2 / 奇 1 居中） ====================
    // 偶数层：2 张竖向排列（上下）；奇数层：1 张，offsetRow=0.5 居中于两张中心。共 16 层。
    {
      x: 0.08, y: 0.52,  // 位于 3.3 左侧（x=0.35 左边），y 与 3.3 对齐
      layers: [
        {
          // 第 1 层（偶）：竖向 2 张基座
          layer: 0, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 2 层（奇）：1 张，居中于下方两张的几何中心
          layer: 1, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 3 层（偶）：竖向 2 张
          layer: 2, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 4 层（奇）：1 张居中
          layer: 3, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 5 层（偶）：竖向 2 张
          layer: 4, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 6 层（奇）：1 张居中
          layer: 5, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 7 层（偶）：竖向 2 张
          layer: 6, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 8 层（奇）：1 张居中
          layer: 7, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 9 层（偶）：竖向 2 张
          layer: 8, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 10 层（奇）：1 张居中
          layer: 9, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 11 层（偶）：竖向 2 张
          layer: 10, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 12 层（奇）：1 张居中
          layer: 11, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 13 层（偶）：竖向 2 张
          layer: 12, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 14 层（奇）：1 张居中
          layer: 13, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 15 层（偶）：竖向 2 张
          layer: 14, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 16 层（奇）：1 张居中
          layer: 15, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
      ]
      // 区域 3.4: (2+1)×8 = 24 张（16 层）
    },

    // ==================== 区域 3.5：与 3.4 镜像对称（3.3 右侧） ====================
    // 层结构与 3.4 完全一致（竖向对称图形本身左右等价），仅 x 翻到右侧。
    {
      x: 0.78, y: 0.52,  // 位于 3.3 右侧，x 采用与区域 1↔2 相同的镜像约定（0.86 - 0.08 = 0.78）
      layers: [
        {
          // 第 1 层（偶）：竖向 2 张基座
          layer: 0, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 2 层（奇）：1 张居中
          layer: 1, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 3 层（偶）：竖向 2 张
          layer: 2, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 4 层（奇）：1 张居中
          layer: 3, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 5 层（偶）：竖向 2 张
          layer: 4, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 6 层（奇）：1 张居中
          layer: 5, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 7 层（偶）：竖向 2 张
          layer: 6, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 8 层（奇）：1 张居中
          layer: 7, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 9 层（偶）：竖向 2 张
          layer: 8, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 10 层（奇）：1 张居中
          layer: 9, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 11 层（偶）：竖向 2 张
          layer: 10, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 12 层（奇）：1 张居中
          layer: 11, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 13 层（偶）：竖向 2 张
          layer: 12, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 14 层（奇）：1 张居中
          layer: 13, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
        {
          // 第 15 层（偶）：竖向 2 张
          layer: 14, gapRatio: 0.1,
          cards: [{ col: 0, row: 0 }, { col: 0, row: 1 }]
        },
        {
          // 第 16 层（奇）：1 张居中
          layer: 15, gapRatio: 0.1, offsetCol: 0, offsetRow: 0.5,
          cards: [{ col: 0, row: 0 }]
        },
      ]
      // 区域 3.5: 24 张（与 3.4 结构完全一致，层数翻倍至 16 层）
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
    },

    // ==================== 区域 6：顶层盖（layer 50 单层 6×6） ====================
    // 目的：在所有 3.x 区域上方放一片 6×6 的顶层卡，将 3.x 顶端的少量卡统一盖住，
    // 视觉上形成一个大的统一板块；必须先清空这 36 张才能触及下方 3.x 区域。
    // 层级 layer=50，远高于 3.3 最高层（layer 23），确保位于所有 3.x 区域之上。
    {
      x: 0.06, y: 0.17,  // 大致居中覆盖中央 3.x 区域，实际视觉中心可再微调
      layers: [
        {
          // 单层 6×6 = 36 张，layer=50 起步
          layer: 50, gapRatio: 0.1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 }, { col: 5, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 }, { col: 5, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 }, { col: 5, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 }, { col: 5, row: 3 },
            { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 }, { col: 5, row: 4 },
            { col: 0, row: 5 }, { col: 1, row: 5 }, { col: 2, row: 5 }, { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 },
          ]
        },
        {
          // 第 2 层：3×3 = 9 张，layer=51，相对 6×6 居中（offset=(6-3)/2=1.5 cell）
          layer: 51, gapRatio: 0.1, offsetCol: 1.5, offsetRow: 1.5,
          cards: [
            { col: -1, row: -1 }, { col: 1, row: -1 }, { col: 3, row: -1 },
            { col: -1, row: 1 }, { col: 1, row: 1 }, { col: 3, row: 1 },
            { col: -1, row: 3 }, { col: 1, row: 3 }, { col: 3, row: 3 },
          ]
        },
        {
          // 第 3 层：layer=52，与第 1 层 6×6 的 row 3 和 row 4 对应位置一致 = 12 张
          // 使用与 layer 50 相同的 gapRatio、默认 offsetCol/Row（不写），col/row 直接沿用 row 3/4 坐标
          layer: 52, gapRatio: 0.1,
          cards: [
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 }, { col: 5, row: 3 },
            { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 }, { col: 5, row: 4 },
          ]
        },
      ]
      // 区域 6: 6×6 + 3×3 + 6×2 = 36 + 9 + 12 = 57 张
    }
  ]
  // 总计 8 + 8 + 40 + 40 + 24 + 24 + 24 + 6 + 6 + 57 = 237 张（237 ÷ 3 = 79，可三消 ✓）
}

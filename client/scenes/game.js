const Scene = require('./base')
const LEVELS = require('./game/levels')
const renders = require('./game/renders/index')
const gameLogic = require('./game/gameLogic')
const props = require('./game/props/index')
const dialogs = require('./game/dialogs/index')
const { post } = require('../utils/request')
const { playBgm, playBgmGroup, playSfx } = require('../utils/audio')

/**
 * 游戏核心场景
 * 羊了个羊 三消玩法：多层卡牌 + 底部槽位
 *
 * 职责：场景生命周期、状态管理、关卡切换、动画/特效更新
 * 渲染分类 → renders/*
 * 游戏逻辑 → gameLogic（含卡牌生成、遮挡判定）
 * 关卡数据 → levels
 */

class GameScene extends Scene {
  constructor() {
    super()
    this.cards = []
    this.slots = []
    this.maxSlots = 7
    this.gameOver = false
    this.gameWin = false
    this.level = 1
    this.anims = []  // 飞行动画队列
    this.matchFx = []  // 消除特效
    this.particles = [] // 粒子效果
    this.history = []  // 撤回历史栈
    this.toast = null   // 屏幕提示 { text, progress, duration }
    this.peekMode = false  // 透视模式：等待点击卡牌
    this.peekCards = []    // 透视中的卡牌引用
    this.peekTimer = 0     // 透视剩余时间 ms
    this.dialog = null       // 当前弹窗：null 或 { title, confirmText, cancelText, onConfirm, onCancel, confirmColor, cancelColor }
    this.levelStartTime = 0  // 关卡开始时间戳
    this.recordSubmitted = false // 通关记录是否已提交
    this.revived = false         // 本关是否已复活过
    this.endFx = null              // 结算特效 { type:'win'|'lose', progress:0, duration:2500, onEnd }
  }

  /** 从菜单进入时重置关卡 */
  onEnter() {
    // 游戏 BGM：从 bg_game 分组随机抽一首
    playBgmGroup('game')
    this.level = 1
    this._startLevel()
  }

  /** 开始当前关卡（不重置 level） */
  _startLevel() {
    this.cards = []
    this.slots = []
    this.gameOver = false
    this.gameWin = false
    this.history = []
    this.recordSubmitted = false
    this.revived = false
    this.endFx = null
    this.levelStartTime = Date.now()

    // 重置道具次数
    props.init()

    // 预加载所有渲染模块所需素材（背景/卡牌/槽位/道具）
    renders.preloadAll()

    // 根据关卡配置生成卡牌
    this.cards = gameLogic.generateCards(this.level, this.width, this.height)
  }

  onTouchStart(x, y) {
    // 结算特效播放中不响应点击
    if (this.endFx) return

    // 弹窗状态下的点击处理（确认弹窗 / 结算弹窗）
    if (this.dialog) {
      const hit = dialogs.hitDialog(x, y, { width: this.width, height: this.height }, this.dialog)
      if (hit === 'confirm') {
        const cb = this.dialog.onConfirm
        this.dialog = null
        cb && cb()
      } else if (hit === 'cancel') {
        const cb = this.dialog.onCancel
        this.dialog = null
        cb && cb()
      }
      // outside / null：点击弹窗外或弹窗内空白，不做任何操作
      return
    }

    // 返回按钮点击检测
    if (renders.backButton.hit(x, y, { width: this.width, height: this.height })) {
      this.dialog = {
        type: 'confirm',
        title: '确认退出游戏？',
        confirmText: '确认退出',
        cancelText: '继续游戏',
        onConfirm: () => { if (this.onBack) this.onBack() },
      }
      return
    }

    if (this.gameOver || this.gameWin) return

    // 道具区点击检测
    for (let i = 0; i < 4; i++) {
      const btn = renders.props.getPropPosition(i, { width: this.width, height: this.height })
      if (x >= btn.x && x <= btn.x + btn.size && y >= btn.y && y <= btn.y + btn.size) {
        const result = props.use(i, { cards: this.cards, slots: this.slots, history: this.history, width: this.width, height: this.height })
        if (result === 'peek') {
          this.peekMode = true
          this._showToast('请点击一张顶层卡牌')
        } else if (typeof result === 'string') {
          this._showToast(result)
        }
        return
      }
    }

    // 动画进行中不响应点击
    if (this.anims.length > 0) return

    // 透视模式：点击顶层卡牌触发透视
    if (this.peekMode) {
      const card = gameLogic.handleTouch(x, y, this.cards)
      if (card) {
        this._activatePeek(card)
      } else {
        // 点击空白取消透视模式
        this.peekMode = false
        this._showToast('透视已取消')
      }
      return
    }

    // 点击检测
    const card = gameLogic.handleTouch(x, y, this.cards)
    if (!card) return

    // 卡牌点击音效
    playSfx('click')

    // 标记卡牌移除（棋盘上不再显示）
    card.removed = true

    // 目标槽位索引：按点击顺序追加到末尾（与 gameLogic.pickCard 一致）
    const insertIdx = this.slots.length

    // 计算目标位置
    const target = renders.slots.getSlotPosition(insertIdx, { width: this.width, height: this.height })

    // 创建飞行动画
    this.anims.push({
      icon: card.icon,
      card: card,
      fromX: card.x,
      fromY: card.y,
      fromW: card.width,
      fromH: card.height,
      toX: target.x,
      toY: target.y,
      toW: target.size,
      toH: target.size,
      progress: 0,
      duration: 250,  // 动画时长 ms
      insertIdx: insertIdx
    })
  }

  update(dt) {
    // 更新飞行动画
    for (let i = this.anims.length - 1; i >= 0; i--) {
      const anim = this.anims[i]
      anim.progress += dt
      if (anim.progress >= anim.duration) {
        // 动画结束，正式放入槽位
        this.slots.splice(anim.insertIdx, 0, { icon: anim.icon })

        // 记录撤回历史（保存卡牌引用和插入位置）
        this.history.push({ card: anim.card, insertIdx: anim.insertIdx })

        // 三消检查（带动效）
        const oldSlots = this.slots.slice()
        this.slots = gameLogic.checkMatch(this.slots)

        // 如果有消除，生成消除特效并清空撤回历史（已消除无法撤回）
        if (this.slots.length < oldSlots.length) {
          this._spawnMatchFx(oldSlots, this.slots)
          this.history = []
        }

        // 输赢判定
        this._checkAndPlayResult()

        // 通关后处理：上报记录 + 根据关卡决定是否进入下一关
        this._onGameWinPostProcess()

        this.anims.splice(i, 1)
      }
    }

    // 更新透视计时器
    if (this.peekTimer > 0) {
      this.peekTimer -= dt
      if (this.peekTimer <= 0) {
        this.peekTimer = 0
        this.peekCards = []
      }
    }

    // 更新屏幕提示
    if (this.toast) {
      this.toast.progress += dt
      if (this.toast.progress >= this.toast.duration) {
        this.toast = null
      }
    }

    // 更新消除特效
    for (let i = this.matchFx.length - 1; i >= 0; i--) {
      this.matchFx[i].progress += dt
      if (this.matchFx[i].progress >= this.matchFx[i].duration) {
        this.matchFx.splice(i, 1)
      }
    }

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.progress += dt
      p.x += p.vx * (dt / 16)
      p.y += p.vy * (dt / 16)
      p.vy += 0.3  // 重力
      if (p.progress >= p.duration) {
        this.particles.splice(i, 1)
      }
    }

    // 结算特效计时
    if (this.endFx) {
      this.endFx.progress += dt
      if (this.endFx.progress >= this.endFx.duration) {
        const cb = this.endFx.onEnd
        this.endFx = null
        cb && cb()
      }
    }
  }

  /** 显示屏幕提示 */
  _showToast(text) {
    this.toast = { text: text, progress: 0, duration: 1500 }
  }

  /**
   * 激活透视效果
   * 点击的顶层卡牌 + 周围 3×3 区域内其他顶层卡牌变透明，
   * 显示它们正下方的下一层卡牌。
   */
  _activatePeek(centerCard) {
    this.peekMode = false
    const size = centerCard.width
    // 3×3 区域范围：以点击卡牌中心向外扩展 1 个卡牌尺寸
    const cx = centerCard.x + size / 2
    const cy = centerCard.y + size / 2
    const range = size * 1.5

    // 收集区域内所有未移除卡牌
    const inRange = []
    for (const card of this.cards) {
      if (card.removed) continue
      const cardCx = card.x + card.width / 2
      const cardCy = card.y + card.height / 2
      if (Math.abs(cardCx - cx) < range && Math.abs(cardCy - cy) < range) {
        inRange.push(card)
      }
    }

    // 找出区域内所有顶层卡牌（未被更高层遮挡的）
    const peekCards = []
    for (const card of inRange) {
      if (!gameLogic.isBlocked(card, this.cards)) {
        peekCards.push(card)
      }
    }

    this.peekCards = peekCards
    this.peekTimer = 3000  // 3 秒
    console.log('[透视] 激活，透视 ' + peekCards.length + ' 张顶层卡牌')
  }

  /** 输赢判定 + 音效（胜利优先，首次进入才响一次） */
  _checkAndPlayResult() {
    const wasOver = this.gameOver || this.gameWin
    const result = gameLogic.checkResult(this.cards, this.slots, this.maxSlots)
    this.gameOver = result.gameOver
    this.gameWin = result.gameWin
    if (!wasOver && this.gameWin) {
      playSfx('success')
      const hasNext = this.level < LEVELS.length
      this._startEndFx('win', () => {
        if (hasNext) {
          this.level++
          this._startLevel()
        } else {
          if (this.onBack) this.onBack()
        }
      })
    } else if (!wasOver && this.gameOver) {
      playSfx('defeat')
      if (!this.revived) {
        // 未复活过：弹出复活弹窗
        this._showReviveDialog()
      } else {
        // 已复活过：播放失败特效后返回主菜单
        this._startEndFx('lose', () => {
          if (this.onBack) this.onBack()
        })
      }
    }
  }

  /** 启动结算全屏特效 */
  _startEndFx(type, onEnd) {
    this.endFx = {
      type: type,
      progress: 0,
      duration: 4000,
      clearTime: (Date.now() - this.levelStartTime) / 1000,
      onEnd: onEnd,
    }
    // 生成庆祝/失败粒子爆发
    const colors = type === 'win'
      ? ['#FFD700', '#00b894', '#48DBFB', '#FECA57', '#FF9FF3', '#55efc4']
      : ['#d63031', '#e17055', '#fdcb6e', '#636e72', '#b2bec3', '#ff7675']
    const cx = this.width / 2
    const cy = this.height * 0.35
    for (let j = 0; j < 24; j++) {
      const angle = (Math.PI * 2 / 24) * j + Math.random() * 0.3
      const speed = 3 + Math.random() * 5
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        radius: 3 + Math.random() * 4,
        color: colors[j % colors.length],
        progress: 0,
        duration: 800 + Math.random() * 600,
      })
    }
  }

  /** 弹出复活弹窗 */
  _showReviveDialog() {
    this.dialog = {
      type: 'revive',
      onConfirm: () => {
        // 复活：执行一次 moveOut，从槽位取牌放到棋盘下方
        this.revived = true
        this.gameOver = false

        // 给 moveOut(0) 加 1 次
        props.addCount(0, 1)

        // 执行 moveOut
        const state = { cards: this.cards, slots: this.slots, history: this.history, width: this.width, height: this.height }
        props.use(0, state)
      },
      onCancel: () => {
        if (this.onBack) this.onBack()
      },
    }
  }

  /**
   * 通关后处理：上报通关记录
   */
  _onGameWinPostProcess() {
    if (!this.gameWin) return
    // 上报通关记录（仅一次）
    if (!this.recordSubmitted) {
      this.recordSubmitted = true
      const clearTime = (Date.now() - this.levelStartTime) / 1000
      console.log('[game] 通关！关卡:', this.level, '耗时:', clearTime.toFixed(1) + 's')
      if (GameGlobal.token) {
        post('/api/record/submit', { level_id: this.level, clear_time: clearTime })
          .then((data) => console.log('[game] 通关记录已上报, id:', data.id))
          .catch((err) => console.warn('[game] 上报失败:', err))
      }
    }
  }

  /** 生成消除特效和粒子 */
  _spawnMatchFx(oldSlots, newSlots) {
    // 三消音效
    playSfx('merge')

    const removedMap = {}
    for (const s of oldSlots) removedMap[s.icon] = (removedMap[s.icon] || 0) + 1
    for (const s of newSlots) removedMap[s.icon] = (removedMap[s.icon] || 0) - 1

    let removedIcon = null
    for (const icon in removedMap) {
      if (removedMap[icon] > 0) { removedIcon = icon; break }
    }
    if (!removedIcon) return

    let count = 0
    for (let i = 0; i < oldSlots.length && count < 3; i++) {
      if (oldSlots[i].icon === removedIcon) {
        const pos = renders.slots.getSlotPosition(i, { width: this.width, height: this.height })
        // 闪光缩放特效
        this.matchFx.push({
          x: pos.x, y: pos.y, size: pos.size,
          icon: removedIcon,
          progress: 0, duration: 350
        })
        // 粒子爆发
        const cx = pos.x + pos.size / 2
        const cy = pos.y + pos.size / 2
        const colors = ['#FFD700', '#FF6B6B', '#48DBFB', '#FF9FF3', '#FECA57', '#00D2D3']
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI * 2 / 6) * j + Math.random() * 0.5
          const speed = 2 + Math.random() * 3
          this.particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            radius: 2 + Math.random() * 3,
            color: colors[j % colors.length],
            progress: 0,
            duration: 400 + Math.random() * 200
          })
        }
        count++
      }
    }
  }

  render() {
    const { ctx, width, height } = this
    const cfg = { width, height }

    // 背景
    renders.background.render(ctx, cfg)

    // 返回按钮
    renders.backButton.render(ctx, cfg)

    // 关卡标题
    const levelIdx = Math.min(this.level - 1, LEVELS.length - 1)
    renders.title.render(ctx, cfg, LEVELS[levelIdx].title)

    // 卡牌
    renders.cards.renderCards(ctx, this.cards, this.peekCards, this.peekTimer)

    // 槽位
    renders.slots.renderSlots(ctx, this.slots, { width, height, maxSlots: this.maxSlots })

    // 道具区
    const propCounts = [props.getCount(0), props.getCount(1), props.getCount(2), props.getCount(3)]
    renders.props.renderProps(ctx, cfg, propCounts)

    // 飞行中的卡牌动画
    renders.flyAnim.render(ctx, this.anims)

    // 三消闪光特效
    renders.matchFx.render(ctx, this.matchFx)

    // 粒子
    renders.particles.render(ctx, this.particles)

    // 屏幕提示
    renders.toast.render(ctx, cfg, this.toast)

    // 结算全屏特效
    renders.endFx.render(ctx, cfg, this.endFx)

    // 弹窗（确认 / 复活，统一由 dialogs 模块绘制）
    if (this.dialog) {
      dialogs.renderDialog(ctx, cfg, this.dialog)
    }
  }
}

module.exports = GameScene

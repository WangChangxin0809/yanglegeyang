# 牛马日记

一款基于微信小游戏平台的「羊了个羊」风格消除类小游戏，支持多关卡、道具系统、全屏结算特效、通关计时与排行榜等完整玩法。

## 功能特性

- 🎮 **核心玩法**：多层卡牌 + 底部槽位三消，支持多关卡进阶
- 🧰 **道具系统**：移出卡片、预览、洗牌重排、撤销操作（部分道具支持分享解锁）
- ⏱️ **通关计时**：关卡内实时显示用时，结算时同步显示最终成绩
- 🎉 **全屏结算特效**：胜利 / 失败均采用全屏动态特效呈现，替代传统弹窗
- 💀 **复活机制**：失败时提供延迟触发的复活弹窗，一键继续挑战
- 🏆 **排行榜**：按关卡查询每位玩家的最快通关成绩
- 📤 **微信分享**：通关可分享成绩到微信好友，分享解锁额外道具
- 🔊 **背景音乐 & 音效**：支持多首游戏 BGM 随机播放与场景音效
- 🔑 **微信登录**：基于 `wx.login` + JWT 的身份认证

## 项目结构

```
├── client/                        # 微信小游戏前端（Canvas 2D）
│   ├── audio/                     # 音频资源（BGM、音效）
│   ├── images/                    # 图片资源
│   │   ├── loading/               # 加载页
│   │   ├── menu/                  # 主菜单（背景、按钮、标题、装饰）
│   │   ├── game/                  # 游戏（背景、卡牌、道具、结算图）
│   │   ├── rank/                  # 排行榜（奖牌、背景）
│   │   └── common/                # 公共图标
│   ├── scenes/                    # 游戏场景
│   │   ├── game/                  # 游戏核心子模块
│   │   │   ├── dialogs/           # 弹窗（确认、复活、胜利、道具分享）
│   │   │   ├── levels/            # 关卡配置
│   │   │   ├── props/             # 道具逻辑
│   │   │   ├── renders/           # 渲染模块（背景、卡牌、槽位、计时器等）
│   │   │   ├── gameLogic.js       # 卡牌生成、遮挡判定
│   │   │   └── levels.js          # 关卡数据
│   │   ├── base.js                # 场景基类
│   │   ├── auth.js                # 授权登录
│   │   ├── loading.js             # 加载场景（资源预加载）
│   │   ├── menu.js                # 主菜单
│   │   ├── game.js                # 游戏场景
│   │   └── rank.js                # 排行榜
│   ├── utils/                     # 工具模块（request、audio、assets）
│   ├── game.js                    # 入口文件
│   ├── game.json                  # 运行环境配置
│   └── global.js                  # 全局状态
├── server/                        # 后端服务（FastAPI + 异步 SQLAlchemy）
│   ├── app/
│   │   ├── api/                   # 路由（auth、record）
│   │   ├── core/                  # 核心配置（数据库连接池）
│   │   ├── middleware/            # 中间件（JWT 鉴权）
│   │   ├── models/                # 数据模型（user、record）
│   │   ├── schemas/               # 请求/响应模型
│   │   ├── services/              # 业务逻辑
│   │   └── utils/                 # 工具（统一响应、微信登录）
│   ├── sql/                       # 数据库 schema
│   ├── tests/                     # 接口测试
│   ├── config.py                  # 配置加载
│   └── main.py                    # 服务入口
├── scripts/                       # 运维脚本（部署、MySQL 初始化、OSS 上传等）
└── docs/                          # 项目文档
    ├── 前端/
    ├── 后端/
    ├── 数据库/
    └── 需求/
```

## 技术栈

### 前端
- **微信小游戏 Canvas 2D** 原生渲染（无框架，自研场景 / 渲染 / 弹窗模块化架构）
- 模块化渲染：`scenes/game/renders/` 拆分为 background / cards / slots / props / title / timer / flyAnim / matchFx / particles / toast / endFx / backButton 等独立模块
- 模块化弹窗：`scenes/game/dialogs/` 统一管理 confirm / revive / win / propShare

### 后端
- **FastAPI** + **Uvicorn**
- **SQLAlchemy 2.x Async ORM** + **asyncmy**（异步 MySQL 驱动）
- **JWT** 鉴权（`pyjwt`）
- 连接池健康管理：`pool_pre_ping` + `pool_recycle` 规避云环境下空闲 TCP 被中间节点清理导致的死连接

### 数据库
- **MySQL 8.x**
- 与「金毛大战波斯猫」项目共用一个 MySQL 实例，本项目表统一使用 `hd_` 前缀

### 部署与运维
- **阿里云 OSS** 托管静态资源（图片 / 音频）
- **Nginx** 反向代理
- `scripts/deploy.py` 一键部署，`scripts/oss_upload/` 资源上传脚本

## 快速开始

### 前端

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本仓库的 `client/` 目录作为小游戏项目
3. 设置中勾选「不校验合法域名」
4. 在模拟器中预览运行

### 后端

1. 确保已安装 [uv](https://github.com/astral-sh/uv) 与 Python 3.13+
2. 复制环境变量模板：
   ```bash
   cd server
   cp .env.example .env
   # 按需修改 .env（数据库、JWT 密钥、微信 AppID/Secret 等）
   ```
3. 安装依赖并启动：
   ```bash
   uv sync
   uv run uvicorn main:app --reload
   ```
4. 访问 <http://127.0.0.1:8000/health> 验证服务状态

详细部署流程见 [本地部署文档](docs/后端/本地部署.md) 和 [服务器部署方案](docs/后端/服务器部署方案.md)。

## 文档

- [前端总览](docs/前端/总览.md) · [API 清单](docs/前端/API清单.md) · [关卡设计指南](docs/前端/关卡设计指南.md)
- [后端总览](docs/后端/总览.md) · [本地部署](docs/后端/本地部署.md) · [服务器部署方案](docs/后端/服务器部署方案.md)
- [数据库总览](docs/数据库/总览.md)
- [图片资源需求](docs/需求/图片资源需求.md) · [音频资源需求](docs/需求/音频资源需求.md)

## License

MIT

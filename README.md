# 牛马日记

一款基于微信小游戏平台开发的「羊了个羊」风格消除类小游戏。

## 项目结构

```
├── client/              # 微信小游戏前端
│   ├── audio/           # 音频资源
│   ├── images/          # 图片资源
│   │   ├── loading/     # 加载页
│   │   ├── menu/        # 主菜单（背景、按钮、标题、装饰）
│   │   ├── game/        # 游戏（背景、卡牌、道具）
│   │   ├── rank/        # 排行榜（背景、奖牌）
│   │   └── common/      # 公共图标
│   ├── scenes/          # 游戏场景
│   │   ├── game/        # 游戏场景（关卡、道具、渲染、逻辑）
│   │   ├── base.js      # 场景基类
│   │   ├── loading.js   # 加载场景
│   │   ├── menu.js      # 主菜单场景
│   │   ├── game.js      # 游戏场景
│   │   └── rank.js      # 排行榜场景
│   ├── utils/           # 工具模块（网络请求等）
│   ├── game.js          # 入口文件
│   ├── game.json        # 运行环境配置
│   └── global.js        # 全局状态管理
├── server/              # 后端服务（FastAPI）
│   ├── app/
│   │   ├── api/         # 路由（用户、记录）
│   │   ├── core/        # 核心配置（数据库、Redis）
│   │   ├── models/      # 数据模型
│   │   └── services/    # 业务逻辑
│   └── main.py          # 服务入口
└── docs/                # 项目文档
    ├── 前端/
    ├── 后端/
    ├── 数据库/
    └── 需求/
```

## 技术栈

- **前端**：微信小游戏原生 Canvas 2D
- **后端**：Python FastAPI + Uvicorn
- **数据库**：PostgreSQL + Redis（缓存）

## 快速开始

### 前端

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入 `client` 目录作为项目
3. 设置中勾选「不校验合法域名」
4. 即可在模拟器中预览运行

### 后端

详见 [本地部署文档](docs/后端/本地部署.md)

## License

MIT

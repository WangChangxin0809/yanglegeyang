"""牛马日记 — 后端服务入口"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.api.auth import router as auth_router
from app.api.record import router as record_router
from config import get_settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化数据库连接"""
    # 启动 — 连接失败仅告警，不阻断服务
    try:
        await init_db()
        logger.info("MySQL 连接成功")
    except Exception as e:
        logger.warning(f"MySQL 连接失败，部分功能不可用: {e}")

    yield


app = FastAPI(
    title="牛马日记 - 后端服务",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — 允许小游戏跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)
app.include_router(record_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}

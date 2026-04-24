"""Redis 异步连接与缓存操作"""

import json
from typing import Any

import redis.asyncio as aioredis

from config import get_settings

settings = get_settings()

redis_client: aioredis.Redis | None = None


async def init_redis() -> aioredis.Redis:
    """初始化 Redis 连接"""
    global redis_client
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def close_redis():
    """关闭 Redis 连接"""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


def get_redis() -> aioredis.Redis:
    """获取 Redis 客户端实例"""
    if redis_client is None:
        raise RuntimeError("Redis 未初始化，请先调用 init_redis()")
    return redis_client


async def cache_get(key: str) -> Any | None:
    """从缓存获取数据（Redis 不可用时返回 None）"""
    if redis_client is None:
        return None
    try:
        data = await redis_client.get(key)
        if data is None:
            return None
        return json.loads(data)
    except Exception:
        return None


async def cache_set(key: str, value: Any, expire: int = 600):
    """写入缓存（Redis 不可用时静默跳过）"""
    if redis_client is None:
        return
    try:
        await redis_client.set(key, json.dumps(value, ensure_ascii=False), ex=expire)
    except Exception:
        pass


async def cache_delete(key: str):
    """删除缓存（Redis 不可用时静默跳过）"""
    if redis_client is None:
        return
    try:
        await redis_client.delete(key)
    except Exception:
        pass

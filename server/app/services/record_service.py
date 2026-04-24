"""通关记录业务逻辑"""

import logging

from sqlalchemy import select, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

logger = logging.getLogger(__name__)

from app.models.record import Record
from app.core.redis import cache_get, cache_set, cache_delete


async def submit_record(user_id: int, level_id: int, clear_time: float, db: AsyncSession) -> Record:
    """提交通关记录"""
    record = Record(user_id=user_id, level_id=level_id, clear_time=clear_time)
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 清除该用户的通关记录缓存
    await cache_delete(f"record:{user_id}")
    # 清除该关卡的排行榜缓存
    await cache_delete(f"rank:{level_id}:50")
    await cache_delete(f"rank:{level_id}:100")

    return record


async def get_records(user_id: int, db: AsyncSession) -> list[Record]:
    """获取用户的所有通关记录"""

    # 先查缓存
    cache_key = f"record:{user_id}"
    cached = await cache_get(cache_key)
    if cached is not None:
        logger.info("[record] 命中 Redis 缓存, key=%s", cache_key)
        return cached

    # 缓存未命中，查数据库
    logger.info("[record] Redis 未命中，查询数据库, user_id=%s", user_id)
    stmt = select(Record).where(Record.user_id == user_id).order_by(Record.created_at.desc())
    result = await db.execute(stmt)
    records = result.scalars().all()

    # 写入缓存
    records_data = [
        {
            "id": r.id,
            "level_id": r.level_id,
            "clear_time": r.clear_time,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
    await cache_set(cache_key, records_data, expire=600)

    return records


async def get_rank(level_id: int, limit: int, db: AsyncSession) -> list[dict]:
    """获取指定关卡的通关排行榜（每人取最快成绩）"""

    cache_key = f"rank:{level_id}:{limit}"
    cached = await cache_get(cache_key)
    if cached is not None:
        logger.info("[rank] 命中 Redis 缓存, key=%s", cache_key)
        return cached

    logger.info("[rank] Redis 未命中，查询数据库, level_id=%s", level_id)

    # 子查询：每个用户在该关卡的最快成绩
    sub = (
        select(
            Record.user_id,
            sa_func.min(Record.clear_time).label("best_time"),
        )
        .where(Record.level_id == level_id)
        .group_by(Record.user_id)
        .subquery()
    )

    stmt = (
        select(
            User.id,
            User.nickname,
            User.avatar_url,
            sub.c.best_time,
        )
        .join(sub, User.id == sub.c.user_id)
        .order_by(sub.c.best_time.asc())
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()

    rank_data = [
        {
            "rank": idx + 1,
            "user_id": row.id,
            "nickname": row.nickname or f"玩家{row.id}",
            "avatar_url": row.avatar_url or "",
            "best_time": row.best_time,
        }
        for idx, row in enumerate(rows)
    ]

    await cache_set(cache_key, rank_data, expire=300)
    return rank_data

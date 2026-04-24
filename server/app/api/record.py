"""通关记录 API 路由"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth_middleware import get_current_user_id
from app.schemas.record import RecordSubmit
from app.services import record_service
from app.utils.response import success, error

router = APIRouter(prefix="/api/record", tags=["通关记录"])


@router.post("/submit")
async def submit_record(
    req: RecordSubmit,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """提交通关记录（关卡ID + 通关时间）"""
    try:
        record = await record_service.submit_record(user_id, req.level_id, req.clear_time, db)
        return success(data={"id": record.id})
    except Exception as e:
        return error(message=str(e))


@router.get("/list")
async def get_records(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """获取当前用户的通关记录"""
    try:
        records = await record_service.get_records(user_id, db)
        return success(data=records)
    except Exception as e:
        return error(message=str(e))


@router.get("/rank")
async def get_rank(
    level_id: int = Query(default=1, description="关卡ID"),
    limit: int = Query(default=50, le=100, description="返回数量"),
    db: AsyncSession = Depends(get_db),
):
    """获取指定关卡的通关排行榜（无需登录）"""
    try:
        rank = await record_service.get_rank(level_id, limit, db)
        return success(data=rank)
    except Exception as e:
        return error(message=str(e))

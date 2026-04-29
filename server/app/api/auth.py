"""登录鉴权 API 路由"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import LoginRequest, UpdateProfileRequest
from app.services import auth_service
from app.utils.response import success, error
from app.middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["登录鉴权"])


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """微信登录（code 换 token）"""
    try:
        data = await auth_service.login(req.code, db)
        return success(data=data)
    except Exception as e:
        return error(message=str(e))


@router.post("/update-profile")
async def update_profile(
    req: UpdateProfileRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """微信授权后上传用户昵称/头像"""
    try:
        data = await auth_service.update_profile(user_id, req.nickname, req.avatar_url, db)
        return success(data=data)
    except Exception as e:
        return error(message=str(e))

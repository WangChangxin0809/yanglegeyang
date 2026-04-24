"""登录鉴权 API 路由"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse
from app.services import auth_service
from app.utils.response import success, error
from app.models.user import User
from app.middleware.auth_middleware import create_token
from config import get_settings

router = APIRouter(prefix="/api/auth", tags=["登录鉴权"])


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """微信登录（code 换 token）"""
    try:
        data = await auth_service.login(req.code, db)
        return success(data=data)
    except Exception as e:
        return error(message=str(e))


@router.post("/dev-login")
async def dev_login(db: AsyncSession = Depends(get_db)):
    """开发模式登录（跳过微信验证，仅 DEBUG=True 时可用）"""
    settings = get_settings()
    if not settings.DEBUG:
        return error(message="仅开发环境可用", code=403)

    try:
        # 查找或创建测试用户
        dev_openid = "dev_test_user"
        stmt = select(User).where(User.openid == dev_openid)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            user = User(openid=dev_openid, nickname="测试用户")
            db.add(user)
            await db.commit()
            await db.refresh(user)

        token = create_token(user.id)
        return success(data={
            "token": token,
            "user_id": user.id,
            "nickname": user.nickname,
            "avatar_url": user.avatar_url,
        })
    except Exception as e:
        return error(message=str(e))

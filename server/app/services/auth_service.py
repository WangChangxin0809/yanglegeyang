"""登录鉴权业务逻辑"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.wechat import code2session
from app.middleware.auth_middleware import create_token


async def login(code: str, db: AsyncSession) -> dict:
    """微信登录：code 换 openid → 查找/创建用户 → 返回 token + 用户信息"""

    # 1. 用 code 换取 openid
    wx_data = await code2session(code)
    openid = wx_data["openid"]

    # 2. 查找或创建用户
    stmt = select(User).where(User.openid == openid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        user = User(openid=openid)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # 3. 生成 JWT Token
    token = create_token(user.id)

    return {
        "token": token,
        "user_id": user.id,
        "nickname": user.nickname,
        "avatar_url": user.avatar_url,
    }

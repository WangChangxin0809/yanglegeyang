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

        # 首次创建：分配默认昵称“玩家{id}”，避免排行榜昵称为空
        # 后续接入微信授权后由 update-profile 覆盖为真实昵称
        if not user.nickname:
            user.nickname = f"玩家{user.id}"
            await db.commit()
            await db.refresh(user)

    # 老用户兼容：历史账号 nickname 为空时回填默认值
    elif not user.nickname:
        user.nickname = f"玩家{user.id}"
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


async def update_profile(user_id: int, nickname: str, avatar_url: str, db: AsyncSession) -> dict:
    """更新用户昵称/头像（微信授权后调用）"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise Exception("用户不存在")

    if nickname:
        user.nickname = nickname
    if avatar_url:
        user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(user)

    return {
        "user_id": user.id,
        "nickname": user.nickname,
        "avatar_url": user.avatar_url,
    }

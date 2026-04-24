"""登录鉴权相关 Schema"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """微信登录请求"""
    code: str


class LoginResponse(BaseModel):
    """登录成功响应"""
    token: str
    user_id: int
    nickname: str
    avatar_url: str

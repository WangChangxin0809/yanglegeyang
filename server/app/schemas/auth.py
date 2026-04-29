"""登录鉴权相关 Schema"""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """微信登录请求"""
    code: str


class LoginResponse(BaseModel):
    """登录成功响应"""
    token: str
    user_id: int
    nickname: str
    avatar_url: str


class UpdateProfileRequest(BaseModel):
    """更新用户资料（微信授权后上传昵称/头像）"""
    nickname: str = Field(default="", max_length=128)
    avatar_url: str = Field(default="", max_length=512)

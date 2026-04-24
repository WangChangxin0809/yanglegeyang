"""微信 API 封装"""

import httpx

from config import get_settings

settings = get_settings()

WX_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session"


async def code2session(code: str) -> dict:
    """用 wx.login() 的 code 换取 openid 和 session_key

    返回示例：
    {
        "openid": "xxx",
        "session_key": "xxx",
        "unionid": "xxx"  (可选)
    }
    """
    params = {
        "appid": settings.WX_APP_ID,
        "secret": settings.WX_APP_SECRET,
        "js_code": code,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(WX_LOGIN_URL, params=params)
        data = resp.json()

    if "errcode" in data and data["errcode"] != 0:
        raise Exception(f"微信登录失败: {data.get('errmsg', '未知错误')}")

    return data

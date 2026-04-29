"""应用配置 — 从环境变量 / .env 文件读取"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """全局配置项，通过环境变量或 .env 文件注入"""

    # ── 应用 ──
    APP_NAME: str = "hustle-diary-server"
    DEBUG: bool = True

    # ── 服务监听 ──
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8089

    # ── MySQL（与金毛大战波斯猫共用一个库，本项目表统一用 hd_ 前缀）──
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "golden_vs_persian"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+asyncmy://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"
        )

    # ── 微信小程序 ──
    WX_APP_ID: str = ""
    WX_APP_SECRET: str = ""

    # ── JWT ──
    JWT_SECRET: str = "please-change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 168  # 7 天

    # ── 阿里云 OSS ──
    OSS_ACCESS_KEY_ID: str = ""
    OSS_ACCESS_KEY_SECRET: str = ""
    OSS_BUCKET_NAME: str = ""
    OSS_ENDPOINT: str = "https://oss-cn-shanghai.aliyuncs.com/"

    # extra="ignore" — 允许 .env 中存在未声明的运维变量（如 SSH_*、MYSQL_ROOT_*）
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()

"""通关记录相关 Schema"""

from datetime import datetime
from pydantic import BaseModel


class RecordSubmit(BaseModel):
    """提交通关记录"""
    level_id: int
    clear_time: float  # 通关时间（秒）


class RecordItem(BaseModel):
    """单条通关记录"""
    id: int
    level_id: int
    clear_time: float
    created_at: datetime

    model_config = {"from_attributes": True}


class RecordListResponse(BaseModel):
    """通关记录列表"""
    records: list[RecordItem]

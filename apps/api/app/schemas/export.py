from typing import List, Any, Dict
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import UserSummary
from app.schemas.post import PostResponse
from app.schemas.collection import CollectionResponse

class UserDataExport(BaseModel):
    user: UserSummary
    profile: Dict[str, Any]
    posts: List[PostResponse]
    collections: List[CollectionResponse]
    exported_at: datetime


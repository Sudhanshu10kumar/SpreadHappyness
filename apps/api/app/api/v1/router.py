from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, posts, social, collections, notifications, admin, export

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
api_router.include_router(posts.router, prefix="/posts", tags=["Writing & Posts"])
api_router.include_router(social.router, prefix="/social", tags=["Social Interactions"])
api_router.include_router(collections.router, prefix="/collections", tags=["Collections"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Moderation & Administration"])
api_router.include_router(export.router, prefix="/export", tags=["Data Export & Privacy"])


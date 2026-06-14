from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoginView, LogoutView, MeView, UserProfileViewSet

router = DefaultRouter()
router.register("users", UserProfileViewSet, basename="users")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]

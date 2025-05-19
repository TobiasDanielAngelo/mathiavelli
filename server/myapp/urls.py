from django.urls import include, path
from rest_framework.routers import DefaultRouter
from knox.views import LogoutView as KnoxLogoutView
from . import views
from .viewsets import *
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()

router.register(r"journals", JournalViewSet)
router.register(r"accounts", AccountViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"transactions", TransactionViewSet)
router.register(r"receivables", ReceivableViewSet)
router.register(r"payables", PayableViewSet)
router.register(r"events", EventViewSet)
router.register(r"tags", TagViewSet)
router.register(r"goals", GoalViewSet)
router.register(r"tasks", TaskViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path("login", views.LoginAPI.as_view(), name="login"),
    path("signup", views.RegistrationAPI.as_view(), name="register"),
    path("reauth", views.ReauthAPI.as_view(), name="reauth"),
    path("logout", KnoxLogoutView.as_view(), name="logout"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

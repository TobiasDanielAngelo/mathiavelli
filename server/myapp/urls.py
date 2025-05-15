from rest_framework.routers import DefaultRouter
from .viewsets import JournalViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r"journals", JournalViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

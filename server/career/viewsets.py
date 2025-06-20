from core.viewsets import CustomModelViewSet
from .serializers import *


class JobViewSet(CustomModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer


class FollowUpViewSet(CustomModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUperializer

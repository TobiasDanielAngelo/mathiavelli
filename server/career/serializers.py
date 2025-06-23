from core.serializers import CustomSerializer
from .models import *


class JobSerializer(CustomSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class FollowUperializer(CustomSerializer):
    class Meta:
        model = FollowUp
        fields = "__all__"

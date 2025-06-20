from rest_framework import serializers
from .models import *


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class FollowUperializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = "__all__"

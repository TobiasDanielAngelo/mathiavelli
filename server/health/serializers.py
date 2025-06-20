from rest_framework import serializers
from .models import *


class WeighInSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeighIn
        fields = "__all__"


class BodyFatSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyFat
        fields = "__all__"


class WaistMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaistMeasurement
        fields = "__all__"


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = "__all__"


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = "__all__"

from .models import *
from core.serializers import CustomSerializer


class WeighInSerializer(CustomSerializer):
    class Meta:
        model = WeighIn
        fields = "__all__"


class BodyFatSerializer(CustomSerializer):
    class Meta:
        model = BodyFat
        fields = "__all__"


class WaistMeasurementSerializer(CustomSerializer):
    class Meta:
        model = WaistMeasurement
        fields = "__all__"


class MealSerializer(CustomSerializer):
    class Meta:
        model = Meal
        fields = "__all__"


class WorkoutSerializer(CustomSerializer):
    class Meta:
        model = Workout
        fields = "__all__"

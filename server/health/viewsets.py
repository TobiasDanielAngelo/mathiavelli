from core.viewsets import CustomModelViewSet
from .serializers import *


class WeighInViewSet(CustomModelViewSet):
    queryset = WeighIn.objects.all()
    serializer_class = WeighInSerializer


class BodyFatViewSet(CustomModelViewSet):
    queryset = BodyFat.objects.all()
    serializer_class = BodyFatSerializer


class WaistMeasurementViewSet(CustomModelViewSet):
    queryset = WaistMeasurement.objects.all()
    serializer_class = WaistMeasurementSerializer


class MealViewSet(CustomModelViewSet):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer


class WorkoutViewSet(CustomModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer

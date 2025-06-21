from .models import *
from .serializers import *
from core.viewsets import CustomModelViewSet


class ScheduleViewSet(CustomModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer


class HabitViewSet(CustomModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class GoalViewSet(CustomModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer


class TaskViewSet(CustomModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TagViewSet(CustomModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class HabitLogViewSet(CustomModelViewSet):
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer

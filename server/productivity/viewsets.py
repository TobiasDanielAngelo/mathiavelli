from .models import *
from .serializers import *
from core.viewsets import CustomModelViewSet
from .utils import generate_missing_events


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

    def list(self, request, *args, **kwargs):
        params = self.request.query_params.copy()
        generate_missing_events(params)
        return super().list(request, *args, **kwargs)


class HabitLogViewSet(CustomModelViewSet):
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer

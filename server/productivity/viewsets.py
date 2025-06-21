from .models import *
from .serializers import *
from core.viewsets import CustomModelViewSet
import datetime


class ScheduleViewSet(CustomModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer


class HabitViewSet(CustomModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

    def perform_create(self, serializer):
        habit = serializer.save()
        self.create_or_update_task(habit)

    def create_or_update_task(self, habit):

        start_dt = None
        end_dt = None
        if habit.date_start:
            start_dt = timezone.make_aware(
                datetime.datetime.combine(habit.date_start, datetime.time.min)
            )
        if habit.date_end:
            end_dt = timezone.make_aware(
                datetime.datetime.combine(habit.date_end, datetime.time.max)
            )

        task, created = Task.objects.get_or_create(
            habit=habit,
            defaults={
                "title": habit.title,
                "description": habit.description,
                "date_start": start_dt,
                "date_end": end_dt,
                "goal": habit.goal,
                "schedule": habit.schedule,
                "importance": 5,
            },
        )

        if not created:
            task.title = habit.title
            task.description = habit.description
            task.date_start = start_dt
            task.date_end = end_dt
            task.goal = habit.goal
            task.schedule = habit.schedule
            task.importance = 5
            task.save()

    def perform_update(self, serializer):
        habit = serializer.save()

        self.create_or_update_task(habit)


class HabitLogViewSet(CustomModelViewSet):
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer


class GoalViewSet(CustomModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer

    def perform_update(self, serializer):
        goal = serializer.save()

        if goal.date_completed:
            goal.date_completed = goal.date_completed or timezone.now().date()
        else:
            goal.date_completed = None

        goal.save()


class TaskViewSet(CustomModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def update_goal_completion_status(self, goal):
        tasks = goal.task_goal.filter(is_archived=False)

        if tasks.exists():
            goal.date_completed = timezone.now().date()
        else:
            goal.date_completed = None

        goal.save()

    def perform_create(self, serializer):
        task = serializer.save()
        self.create_or_update_event(task)

    def perform_update(self, serializer):
        task = serializer.save()
        if task.is_archived:
            pass
        else:
            self.create_or_update_event(task)

        if task.goal:
            self.update_goal_completion_status(task.goal)

    def perform_destroy(self, instance):
        instance.delete()

    def create_or_update_event(self, task):
        start_dt = None
        end_dt = None

        if task.date_start:
            start_dt = timezone.make_aware(
                datetime.datetime.combine(task.date_start, datetime.time.min)
            )
        if task.date_end:
            end_dt = timezone.make_aware(
                datetime.datetime.combine(task.date_end, datetime.time.max)
            )

        event, created = Event.objects.get_or_create(
            task=task,
            defaults={
                "title": task.title,
                "description": task.description,
                "date_start": start_dt,
                "date_end": end_dt,
                "all_day": True,
            },
        )

        if not created:
            event.title = task.title
            event.description = task.description
            event.date_start = start_dt
            event.date_end = end_dt
            event.all_day = True
            event.save()


class TagViewSet(CustomModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

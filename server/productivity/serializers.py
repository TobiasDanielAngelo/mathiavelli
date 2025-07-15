from .models import *
from django.utils import timezone
from core.serializers import CustomSerializer
from rest_framework import serializers


class EventSerializer(CustomSerializer):
    class Meta:
        model = Event
        fields = "__all__"

    def validate(self, data):
        start = data.get("date_start")
        end = data.get("date_end")
        if start and end and start >= end:
            raise ValidationError(
                {
                    "date_start": ["Start time must be before end time."],
                    "date_end": ["End time must be after start time."],
                }
            )
        return data


class TagSerializer(CustomSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class GoalSerializer(CustomSerializer):

    class Meta:
        model = Goal
        fields = "__all__"

    def validate(self, data):
        start = data.get("date_start")
        end = data.get("date_end")
        if start and end and start > end:
            raise ValidationError(
                {
                    "date_start": ["Start time must be before end time."],
                    "date_end": ["End time must be after start time."],
                }
            )
        return data

    def update(self, instance, validated_data):
        if "set_completed" in validated_data:
            completed = validated_data.pop("set_completed")
            instance.date_completed = timezone.now().date() if completed else None

        return super().update(instance, validated_data)


class TaskSerializer(CustomSerializer):
    class Meta:
        model = Task
        fields = "__all__"

    def validate(self, data):
        start = data.get("date_start")
        end = data.get("date_end")
        if start and end and start > end:
            raise ValidationError(
                {
                    "date_start": ["Start time must be before end time."],
                    "date_end": ["End time must be after start time."],
                }
            )
        return super().validate(data)


class ScheduleSerializer(CustomSerializer):
    associated_task = serializers.SerializerMethodField()
    associated_habit = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = "__all__"

    def get_associated_task(self, obj):
        task = obj.task_schedule.first()
        return task.pk if task else None

    def get_associated_habit(self, obj):
        habit = obj.habit_schedule.first()
        return habit.pk if habit else None


class HabitSerializer(CustomSerializer):
    class Meta:
        model = Habit
        fields = "__all__"


class HabitLogSerializer(CustomSerializer):
    class Meta:
        model = HabitLog
        fields = "__all__"

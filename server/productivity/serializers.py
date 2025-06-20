from rest_framework import serializers
from .models import *
from core.helpers import get_datetimes
from django.utils import timezone


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

    def validate(self, data):
        start = data.get("start")
        end = data.get("end")
        if start and end and start >= end:
            raise ValidationError(
                {
                    "start": ["Start time must be before end time."],
                    "end": ["End time must be after start time."],
                }
            )
        return data


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class GoalSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    # Optional: allow client to toggle completion via boolean
    set_completed = serializers.BooleanField(write_only=True, required=False)

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

    def get_is_completed(self, obj):
        return obj.date_completed is not None

    def update(self, instance, validated_data):
        if "set_completed" in validated_data:
            completed = validated_data.pop("set_completed")
            instance.date_completed = timezone.now().date() if completed else None

        return super().update(instance, validated_data)


class TaskSerializer(serializers.ModelSerializer):
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


class ScheduleSerializer(serializers.ModelSerializer):
    datetimes = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = "__all__"

    def get_datetimes(self, obj):
        return get_datetimes(obj)


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = "__all__"


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = "__all__"

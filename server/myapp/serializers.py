from rest_framework import serializers
from django.contrib.auth import authenticate, hashers, password_validation
from django.contrib.auth.models import User
from .models import *
from django.utils import timezone

from dateutil.rrule import (
    rrule,
    rruleset,
    weekday,
    YEARLY,
    MONTHLY,
    WEEKLY,
    DAILY,
    HOURLY,
    MINUTELY,
    SECONDLY,
)
from dateutil.parser import parse
from datetime import datetime, time, timedelta


class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = "__all__"


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class BuyListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyListItem
        fields = "__all__"


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = "__all__"


class CredentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credential
        fields = "__all__"


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class FollowUperializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    receivableId = serializers.IntegerField(
        required=False, allow_null=True, write_only=True
    )
    payableId = serializers.IntegerField(
        required=False, allow_null=True, write_only=True
    )

    class Meta:
        model = Transaction
        fields = "__all__"

    def validate(self, data):
        transmitter = data.get("transmitter")
        receiver = data.get("receiver")

        if transmitter and receiver and transmitter == receiver:
            raise serializers.ValidationError(
                "Transmitter and receiver must be different."
            )

        return data


class ReceivableSerializer(serializers.ModelSerializer):
    payment_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Receivable
        fields = "__all__"

    def get_payment_total(self, obj):
        return obj.payment.aggregate(total=models.Sum("amount"))["total"] or 0


class PayableSerializer(serializers.ModelSerializer):
    payment_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Payable
        fields = "__all__"

    def get_payment_total(self, obj):
        return obj.payment.aggregate(total=models.Sum("amount"))["total"] or 0


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


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "token"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(
                request=self.context.get("request"),
                username=username,
                password=password,
            )
            if not user:
                raise serializers.ValidationError(
                    "Unable to login with provided credentials.", code="authorization"
                )
        else:
            raise serializers.ValidationError(
                "Must include username and password.", code="authorization"
            )

        data["user"] = user
        return super(LoginSerializer, self).validate(data)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    password_2 = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        model = User
        fields = "__all__"

    def validate_password1(self, data):
        result = password_validation.validate_password(data["password"])
        if data["password"] != data["password_2"]:
            raise serializers.ValidationError("Password doesn't match")
        elif result is not None:
            raise serializers.ValidationError("The password is not strong enough")
        else:
            return data

    def validate(self, data):
        if not (data.get("password") and data.get("password_2")):
            return super().validate(data)
        self.validate_password1(data)
        data.pop("password_2")
        return super().validate(data)

    def create(self, validated_data):
        password = validated_data["password"]
        validated_data.pop("password")
        user = User.objects.create(
            **validated_data,
            password=hashers.make_password(password),
        )
        return user

    def update(self, instance, validated_data):
        if validated_data.get("avatar"):
            validated_data.pop("avatar")
        if validated_data.get("password"):
            validated_data.pop("password")
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = "__all__"


class PersonalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalItem
        fields = "__all__"


FREQ_MAP = {
    0: YEARLY,
    1: MONTHLY,
    2: WEEKLY,
    3: DAILY,
    4: HOURLY,
    5: MINUTELY,
    6: SECONDLY,
}

WEEKDAY_MAP = {"MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6}


class ScheduleSerializer(serializers.ModelSerializer):
    datetimes = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = "__all__"

    def get_datetimes(self, obj):
        if not obj.start_date:
            return []
        end_dt = None
        # Use start_time if available
        start_dt = timezone.make_aware(
            datetime.combine(obj.start_date, obj.start_time or time(0, 0))
        )
        if obj.end_date:
            end_dt = timezone.make_aware(
                datetime.combine(obj.end_date, obj.end_time or time(23, 59))
            )

        rule_kwargs = {
            "freq": FREQ_MAP.get(obj.freq, DAILY),
            "dtstart": start_dt,
            "interval": int(obj.interval or 1),
        }

        # Optional rule fields
        if obj.count:
            rule_kwargs["count"] = int(obj.count)
        if end_dt:
            end_dt = datetime.combine(obj.end_date, obj.end_time or time(23, 59))
            rule_kwargs["until"] = end_dt
        if obj.by_week_day:
            rule_kwargs["byweekday"] = [WEEKDAY_MAP[d] for d in obj.by_week_day]
        if obj.by_month_day:
            rule_kwargs["bymonthday"] = obj.by_month_day
        if obj.by_month:
            rule_kwargs["bymonth"] = obj.by_month
        if obj.by_year_day:
            rule_kwargs["byyearday"] = obj.by_year_day
        if obj.by_week_no:
            rule_kwargs["byweekno"] = obj.by_week_no
        if obj.by_hour:
            rule_kwargs["byhour"] = obj.by_hour
        if obj.by_minute:
            rule_kwargs["byminute"] = obj.by_minute
        if obj.by_second:
            rule_kwargs["bysecond"] = obj.by_second
        if obj.by_set_position:
            rule_kwargs["bysetpos"] = obj.by_set_position
        if obj.week_start is not None:
            rule_kwargs["wkst"] = obj.week_start

        # Generate occurrences (limit for safety)
        try:
            dates = list(rrule(**rule_kwargs))[:100]  # Limit to first 100 occurrences
            return [dt.isoformat() for dt in dates]
        except Exception as e:
            return [f"Error: {str(e)}"]


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = "__all__"


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = "__all__"

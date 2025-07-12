from rest_framework import serializers
from django.contrib.auth import authenticate, hashers, password_validation
from django.contrib.auth.models import User
from .models import *


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


class CustomSerializer(serializers.ModelSerializer):
    pass


class SettingSerializer(CustomSerializer):
    class Meta:
        model = Setting
        fields = "__all__"

    def validate(self, data):
        # only validate UGW, GW4, GW3, GW2, GW1
        if data.get("key") not in ["UGW", "GW4", "GW3", "GW2", "GW1"]:
            return data

        if data.get("value") is None or data.get("value") == "":
            return data

        keys_order = ["UGW", "GW4", "GW3", "GW2", "GW1"]

        # load existing settings
        settings = {s.key: s.value for s in Setting.objects.filter(key__in=keys_order)}

        # use this new value for current key
        settings[data["key"]] = data.get("value")

        last_value = None
        for k in keys_order:
            val = settings.get(k)
            if val is None:
                continue
            if last_value is not None and Decimal(val) <= Decimal(last_value):
                raise serializers.ValidationError(
                    f"{k} must be greater than previous non-empty goal."
                )
            last_value = val

        return data

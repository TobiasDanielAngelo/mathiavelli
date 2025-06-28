from rest_framework import serializers
from django.contrib.auth import authenticate, hashers, password_validation
from django.contrib.auth.models import User
from django.db.models import Field
from django.db.models import ForeignKey, OneToOneField, ManyToManyField
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
    def get_fields(self):
        fields = super().get_fields()

        for field_name, field in list(fields.items()):

            if field_name.endswith(".name"):
                continue

            if isinstance(field, serializers.PrimaryKeyRelatedField):
                name_field = f"{field_name}.name"
                fields[name_field] = serializers.SerializerMethodField()
                if not hasattr(self.__class__, f"get_{name_field}"):

                    def make_single_getter(fn):
                        return lambda self_, obj: (
                            str(getattr(obj, fn)) if getattr(obj, fn) else None
                        )

                    setattr(
                        self.__class__,
                        f"get_{name_field}",
                        make_single_getter(field_name),
                    )

            # Handle ManyToMany
            elif isinstance(field, serializers.ManyRelatedField):
                name_field = f"{field_name}.name"
                fields[name_field] = serializers.SerializerMethodField()
                if not hasattr(self.__class__, f"get_{name_field}"):

                    def make_list_getter(fn):
                        return lambda self_, obj: (
                            [str(item) for item in getattr(obj, fn).all()]
                            if getattr(obj, fn)
                            else []
                        )

                    setattr(
                        self.__class__,
                        f"get_{name_field}",
                        make_list_getter(field_name),
                    )

            elif isinstance(field, serializers.ChoiceField):
                name_field = f"{field_name}.name"
                fields[name_field] = serializers.SerializerMethodField()
                if not hasattr(self.__class__, f"get_{name_field}"):

                    def make_choice_getter(fn):
                        def getter(self_, obj):
                            try:
                                model_field: Field = self_.Meta.model._meta.get_field(
                                    fn
                                )
                                value = getattr(obj, fn)
                                return dict(model_field.flatchoices).get(value, None)
                            except Exception:
                                return None

                        return getter

                    setattr(
                        self.__class__,
                        f"get_{name_field}",
                        make_choice_getter(field_name),
                    )

        return fields


class SettingSerializer(CustomSerializer):
    class Meta:
        model = Setting
        fields = "__all__"

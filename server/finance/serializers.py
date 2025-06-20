from rest_framework import serializers
from django.contrib.auth import authenticate, hashers, password_validation
from django.contrib.auth.models import User
from .models import *


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


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCategory
        fields = "__all__"


class PersonalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalItem
        fields = "__all__"

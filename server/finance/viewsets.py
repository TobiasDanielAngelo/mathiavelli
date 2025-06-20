from .serializers import *
from core.viewsets import CustomModelViewSet


class AccountViewSet(CustomModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer


class CategoryViewSet(CustomModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TransactionViewSet(CustomModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def perform_create(self, serializer):
        receivable_id = self.request.data.get("receivable_id")
        payable_id = self.request.data.get("payable_id")

        transaction = serializer.save()

        if receivable_id:
            try:
                receivable = Receivable.objects.get(pk=receivable_id)
                receivable.payment.add(transaction)
                receivable.check_and_close()
            except Receivable.DoesNotExist:
                raise serializers.ValidationError("Receivable not found")

        if payable_id:
            try:
                payable = Payable.objects.get(pk=payable_id)
                payable.payment.add(transaction)
                payable.check_and_close()
            except Payable.DoesNotExist:
                raise serializers.ValidationError("Payable not found")


class ReceivableViewSet(CustomModelViewSet):
    queryset = Receivable.objects.all()
    serializer_class = ReceivableSerializer


class PayableViewSet(CustomModelViewSet):
    queryset = Payable.objects.all()
    serializer_class = PayableSerializer


class BuyListItemViewSet(CustomModelViewSet):
    queryset = BuyListItem.objects.all()
    serializer_class = BuyListItemSerializer


class InventoryCategoryViewSet(CustomModelViewSet):
    queryset = InventoryCategory.objects.all()
    serializer_class = InventoryCategorySerializer


class PersonalItemViewSet(CustomModelViewSet):
    queryset = PersonalItem.objects.all()
    serializer_class = PersonalItemSerializer

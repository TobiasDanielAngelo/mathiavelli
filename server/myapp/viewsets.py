from rest_framework import viewsets, response
from .models import *
from .serializers import *
from .helpers import obj_list_to_obj_val
from .permissions import CustomDjangoModelPermission
from knox.auth import TokenAuthentication
from rest_framework.permissions import (
    IsAuthenticated,
)


class CustomModelViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        CustomDjangoModelPermission,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        params_copy = params.copy()
        order_by = ""
        try:
            params_copy.pop("page")
        except:
            pass
        try:
            order_by = params_copy.pop("order_by")[0]
        except:
            pass
        queryset = self.filter_queryset(self.get_queryset()).filter(
            **obj_list_to_obj_val(**params_copy)
        )
        if order_by != "":
            queryset = queryset.order_by(order_by)
        if params.get("page"):
            queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class JournalViewSet(CustomModelViewSet):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer


class AccountViewSet(CustomModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer


class CategoryViewSet(CustomModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TransactionViewSet(CustomModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class ReceivableViewSet(CustomModelViewSet):
    queryset = Receivable.objects.all()
    serializer_class = ReceivableSerializer


class PayableViewSet(CustomModelViewSet):
    queryset = Payable.objects.all()
    serializer_class = PayableSerializer


class TagViewSet(CustomModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class GoalViewSet(CustomModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer


class TaskViewSet(CustomModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

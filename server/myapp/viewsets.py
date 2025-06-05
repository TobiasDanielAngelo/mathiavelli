from rest_framework import viewsets, response
from .models import *
from .serializers import *
from .helpers import obj_list_to_obj_val
from .permissions import CustomDjangoModelPermission
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import FieldDoesNotExist
from .paginations import CustomPagination
from django.db.models import Q
import base64
import json
from lzstring import LZString


def decode_query_param(encoded_param):
    lz = LZString()
    return json.loads(lz.decompressFromEncodedURIComponent(encoded_param))


class CustomModelViewSet(viewsets.ModelViewSet):
    permission_classes = [
        # IsAuthenticated,
        # CustomDjangoModelPermission,
        AllowAny
    ]
    # authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params.copy()
        page_param = params.get("page", None)
        order_by = params.pop("order_by", [])
        encoded = params.get("q", None)

        decoded_params = {}
        if encoded:
            try:
                decoded_params = decode_query_param(encoded)
                print(decoded_params)
                params = decoded_params
            except Exception as e:
                print("Decoding failed:", e)

        filter_kwargs = {}
        exclude_kwargs = {}
        search_q = Q()
        model_fields = [f.name for f in self.queryset.model._meta.get_fields()]
        for key, value in params.items():
            base_key = key.split("__")[0]
            if base_key not in model_fields:
                print(f"Skipping invalid field: {key}")
                continue
            if "__search" in key:
                field_name = key.replace("__search", "")
                search_terms = value.split()
                try:
                    field = self.queryset.model._meta.get_field(field_name)
                except FieldDoesNotExist:
                    for term in search_terms:
                        search_q &= Q(**{f"{field_name}__icontains": term})
                    continue
                if field.choices:
                    matched_values = [
                        val
                        for val, label in field.choices
                        if any(term.lower() in label.lower() for term in search_terms)
                    ]
                    search_q &= Q(**{f"{field_name}__in": matched_values})
                else:
                    for term in search_terms:
                        search_q &= Q(**{f"{field_name}__icontains": term})
            elif "__not_" in key:
                actual_key = key.replace("__not_", "__")
                if actual_key.endswith("__in"):
                    exclude_kwargs[actual_key] = value.split(",")
                else:
                    exclude_kwargs[actual_key] = value
            else:
                if key.endswith("__in"):
                    filter_kwargs[key] = value.split(",")
                else:
                    filter_kwargs[key] = value

        queryset = (
            self.filter_queryset(self.get_queryset())
            .filter(**filter_kwargs)
            .filter(search_q)
            .exclude(**exclude_kwargs)
        )

        if order_by:
            queryset = queryset.order_by(*order_by)
        else:
            queryset = queryset.order_by("-id")

        if page_param == "all":
            all_queryset = list(queryset)
            serializer = self.get_serializer(all_queryset, many=True)

            return response.Response(
                {
                    "count": len(all_queryset),
                    "current_page": 1,
                    "total_pages": 1,
                    "next": None,
                    "previous": None,
                    "ids": [
                        item.get("id")
                        for item in serializer.data
                        if isinstance(item, dict)
                    ],
                    "results": serializer.data,
                }
            )

        queryset = self.paginate_queryset(queryset)
        if queryset is not None:
            serializer = self.get_serializer(queryset, many=True)
            return self.get_paginated_response(serializer.data)


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

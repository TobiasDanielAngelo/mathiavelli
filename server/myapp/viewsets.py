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
import json
from lzstring import LZString
import datetime


def decode_query_param(encoded_param):
    lz = LZString()
    return json.loads(lz.decompressFromEncodedURIComponent(encoded_param))


class CustomModelViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        CustomDjangoModelPermission,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params.copy()
        page_param = params.get("page", None)
        order_by = params.pop("order_by", [])
        encoded = params.get("q", None)

        decoded_params = {}
        if encoded:
            try:
                decoded_params = decode_query_param(encoded)
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
            try:
                queryset = queryset.order_by(*order_by)
            except Exception as e:
                print("Order failed:", e)
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


class TagViewSet(CustomModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class BuyListItemViewSet(CustomModelViewSet):
    queryset = BuyListItem.objects.all()
    serializer_class = BuyListItemSerializer


class PlatformViewSet(CustomModelViewSet):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer


class CredentialViewSet(CustomModelViewSet):
    queryset = Credential.objects.all()
    serializer_class = CredentialSerializer


class JobViewSet(CustomModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer


class FollowUpViewSet(CustomModelViewSet):
    queryset = FollowUp.objects.all()
    serializer_class = FollowUperializer


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
        tasks = goal.tasks.filter(is_cancelled=False)

        if tasks.exists() and all(task.is_completed for task in tasks):
            goal.is_completed = True
            goal.date_completed = timezone.now().date()
        else:
            goal.is_completed = False
            goal.date_completed = None

        goal.save()

    def perform_create(self, serializer):
        task = serializer.save()
        self.create_or_update_event(task)

    def perform_update(self, serializer):
        task = serializer.save()

        if task.is_completed or task.is_cancelled:
            if hasattr(task, "event"):
                task.event.delete()
        else:
            self.create_or_update_event(task)

        if task.goal:
            self.update_goal_completion_status(task.goal)

    def perform_destroy(self, instance):
        if hasattr(instance, "event"):
            instance.event.delete()
        instance.delete()

    def create_or_update_event(self, task):
        if not task.date_start or not task.date_end:
            if hasattr(task, "event"):
                task.event.delete()
            return

        start_dt = timezone.make_aware(
            datetime.datetime.combine(task.date_start, datetime.time.min)
        )
        end_dt = timezone.make_aware(
            datetime.datetime.combine(task.date_end, datetime.time.max)
        )

        event, created = Event.objects.get_or_create(
            task=task,
            defaults={
                "title": task.title,
                "description": task.description,
                "start": start_dt,
                "end": end_dt,
                "all_day": True,
            },
        )

        if not created:
            event.title = task.title
            event.description = task.description
            event.start = start_dt
            event.end = end_dt
            event.all_day = True
            event.save()

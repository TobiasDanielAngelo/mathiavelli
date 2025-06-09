from rest_framework import viewsets, response
from django.db.models.functions import (
    ExtractYear,
    ExtractQuarter,
    Concat,
    TruncMonth,
    Cast,
)
from django.db.models import Sum, CharField, F, Value, Func
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Transaction

from itertools import chain
from collections import defaultdict
from decimal import Decimal


class TransactionAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [
        AllowAny,
    ]

    def list(self, request):
        queryset = Transaction.objects.all()
        params = self.request.query_params.copy()

        incoming = (
            queryset.annotate(
                year=ExtractYear("datetime_transacted"),
                quarter=ExtractQuarter("datetime_transacted"),
                yearmonth=TruncMonth("datetime_transacted"),
            )
            .annotate(
                period=Func(
                    F("datetime_transacted"),
                    Value("YYYY-MM"),
                    function="to_char",
                    output_field=CharField(),
                )
                # period=Concat(
                #     F("year"), Value("-Q"), F("quarter"), output_field=CharField()
                # )
            )
            .values("receiver", "period")
            .annotate(total=Sum("amount"))
        )
        outgoing = (
            queryset.annotate(
                year=ExtractYear("datetime_transacted"),
                quarter=ExtractQuarter("datetime_transacted"),
                yearmonth=TruncMonth("datetime_transacted"),
            )
            .annotate(
                period=Func(
                    F("datetime_transacted"),
                    Value("YYYY-MM"),
                    function="to_char",
                    output_field=CharField(),
                )
                # period=Concat(
                #     F("year"), Value("-Q"), F("quarter"), output_field=CharField()
                # )
            )
            .values("transmitter", "period")
            .annotate(total=Sum("amount"))
        )

        accounts = defaultdict(
            lambda: defaultdict(lambda: {"incoming": 0, "outgoing": 0})
        )

        for row in outgoing:
            acc = row["transmitter"]
            period = row["period"]
            accounts[acc][period]["outgoing"] = row["total"]

        for row in incoming:
            acc = row["receiver"]
            period = row["period"]
            accounts[acc][period]["incoming"] = row["total"]

        result = []
        for acc, periods in accounts.items():
            for period, vals in periods.items():
                result.append(
                    {
                        "account": acc,
                        "period": period,
                        "incoming": vals["incoming"],
                        "outgoing": vals["outgoing"],
                        "total": vals["incoming"] - vals["outgoing"],
                        "id": f"{acc}_{period}",
                    }
                )

        sorted_result = sorted(result, key=lambda x: x["period"])

        return response.Response(
            {
                "count": len(result),
                "current_page": 1,
                "total_pages": 1,
                "next": None,
                "previous": None,
                "ids": [
                    item.get("id") for item in sorted_result if isinstance(item, dict)
                ],
                "results": sorted_result,
            }
        )

        # result = (
        #     queryset
        #     # 📆 Add 'year' and 'quarter' columns extracted from 'datetime_transacted'
        #     .annotate(
        #         year=ExtractYear("datetime_transacted"),
        #         quarter=ExtractQuarter("datetime_transacted"),
        #     )
        #     # 🧩 Create a 'period' string like "2025-Q2" using year and quarter
        #     .annotate(
        #         period=Concat(
        #             F("year"), Value("-Q"), F("quarter"), output_field=CharField()
        #         )
        #     )
        #     # 🧮 Group data by these fields — determines dimensions of the result
        #     .values("category", "transmitter", "receiver", "period")
        #     # 🆔 Create a temporary 'id' field by joining category with an underscore (you may want to include more fields here)
        #     # 🧹 Limit fields to 'id' and 'category' before final aggregation
        #     .values("category").annotate(
        #         id=Concat(
        #             F("category"),
        #             Value(""),
        #             output_field=CharField(),
        #         )
        #     )
        #     # 💰 Final step: aggregate total amount for each group
        #     .annotate(total=Sum("amount"))
        # )

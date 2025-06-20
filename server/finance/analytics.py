from rest_framework import viewsets, response
from knox.auth import TokenAuthentication
from django.db.models import Sum, F
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from collections import defaultdict
from core.utils import annotate_period


class TransactionAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
    ]

    authentication_classes = (TokenAuthentication,)

    def list(self, request):
        queryset = Transaction.objects.all()
        queryset = annotate_period(queryset, "datetime_transacted", *("year", "week"))
        # Switch here with params
        params = self.request.query_params.copy()
        graph = params.get("graph", None)
        if not graph:
            return response.Response({})

        result = []
        if graph == "line":
            queryset = queryset.values("receiver", "transmitter", "period", "amount")
            accounts = defaultdict(
                lambda: defaultdict(lambda: {"incoming": 0, "outgoing": 0})
            )
            for row in queryset:
                period = row["period"]
                amount = row["amount"]
                accounts[row["receiver"]][period]["incoming"] += amount
                accounts[row["transmitter"]][period]["outgoing"] += amount
            result = [
                {
                    "account": acc,
                    "period": period,
                    "incoming": vals["incoming"],
                    "outgoing": vals["outgoing"],
                    "total": vals["incoming"] - vals["outgoing"],
                    "id": f"{acc}_{period}",
                }
                for acc, periods in accounts.items()
                for period, vals in periods.items()
            ]
            result = sorted(result, key=lambda x: x["period"])

        elif graph == "pie":
            result = queryset.values("category").annotate(
                total=Sum("amount"), id=F("category")
            )

        return response.Response(
            {
                "count": len(result),
                "current_page": 1,
                "total_pages": 1,
                "next": None,
                "previous": None,
                "ids": [item.get("id") for item in result if isinstance(item, dict)],
                "results": result,
            }
        )

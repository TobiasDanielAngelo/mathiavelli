from rest_framework import viewsets, response
from knox.auth import TokenAuthentication
from django.db.models import Sum, F
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from collections import defaultdict
from core.utils import annotate_period, generate_period_list


class TransactionAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
    ]

    authentication_classes = (TokenAuthentication,)

    def list(self, request):
        queryset = Transaction.objects.all()
        queryset = annotate_period(
            queryset, "datetime_transacted", *("year", "month", "day")
        )
        period_list = generate_period_list(
            queryset, "datetime_transacted", *("year", "month", "day")
        )

        result = []
        line_result = []
        queryset_line = queryset.values("receiver", "transmitter", "period", "amount")
        accounts = defaultdict(
            lambda: defaultdict(lambda: {"incoming": 0, "outgoing": 0})
        )

        for row in queryset_line:
            period = row["period"]
            amount = row["amount"]
            accounts[row["receiver"]][period]["incoming"] += amount
            accounts[row["transmitter"]][period]["outgoing"] += amount

        for period in period_list:
            print(period)
            for acc, periods in accounts.items():
                print(periods)
                vals = periods.get(period, {})
                incoming = vals.get("incoming", 0)
                outgoing = vals.get("outgoing", 0)

                line_result.append(
                    {
                        "graph": "line",
                        "account": acc,
                        "period": period,
                        "incoming": incoming,
                        "outgoing": outgoing,
                        "total": incoming - outgoing,
                        "id": f"{acc}_{period}",
                    }
                )

        line_result = sorted(line_result, key=lambda x: x["period"])

        # Prepare the pie graph data
        pie_result = queryset.values("category").annotate(
            total=Sum("amount"), id=F("category")
        )
        pie_result = [
            {
                "graph": "pie",  # Annotating as pie graph data
                "category": row["category"],
                "total": row["total"],
                "id": row["id"],
            }
            for row in pie_result
        ]

        # Combine both results
        result = line_result + pie_result

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

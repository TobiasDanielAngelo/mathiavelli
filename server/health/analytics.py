from rest_framework import viewsets, response
from django.db.models import Sum, F, Avg
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import WeighIn
from collections import defaultdict
from core.utils import annotate_period, generate_period_list
from core.viewsets import CustomAuthentication


class WeighInAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [
        # IsAuthenticated,
        AllowAny
    ]

    # authentication_classes = (CustomAuthentication,)

    def list(self, request):
        queryset = WeighIn.objects.all()
        queryset = annotate_period(queryset, "date", *("year", "month", "day"))
        period_list = generate_period_list(queryset, "date", *("year", "month", "day"))
        weight_map = {
            str(item["period"]): float(item["ave_weight"])
            for item in queryset.values("period").annotate(ave_weight=Avg("weight_kg"))
        }

        result = [
            {"id": period, "period": period, "ave_weight": weight_map.get(period)}
            for period in period_list
        ]

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

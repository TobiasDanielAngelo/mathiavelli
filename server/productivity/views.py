from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RedeemPoint
from django.db.models import Sum


class AvailablePointsAPIView(APIView):
    def get(self, request):
        total = RedeemPoint.objects.aggregate(total=Sum("amount"))["total"] or 0
        return Response({"available_points": total})

    def post(self, request):
        total = RedeemPoint.objects.aggregate(total=Sum("amount"))["total"] or 0

        if total <= 0:
            return Response(
                {"error": "No points to redeem."}, status=status.HTTP_400_BAD_REQUEST
            )

        RedeemPoint.objects.create(log=None, amount=-total)

        return Response({"success": True, "deducted": total, "new_total": 0})

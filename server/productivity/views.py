from rest_framework import response
from .serializers import *
from core.views import CustomAPIView


class GenerateEventsView(CustomAPIView):

    def get(self, request):
        from .utils import generate_missing_events

        params = self.request.query_params.copy()
        new_events = generate_missing_events(params)

        return response.Response(
            {
                "count": len(new_events),
                "current_page": 1,
                "total_pages": 1,
                "next": None,
                "previous": None,
                "ids": [
                    item.get("id") for item in new_events if isinstance(item, dict)
                ],
                "results": EventSerializer(new_events, many=True).data,
            }
        )

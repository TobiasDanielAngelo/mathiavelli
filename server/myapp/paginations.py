from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math


class CustomPagination(PageNumberPagination):
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        total_pages = math.ceil(
            self.page.paginator.count / self.page.paginator.per_page
        )

        ids = [
            item.get("id") for item in data if isinstance(item, dict) and "id" in item
        ]

        return Response(
            {
                "count": self.page.paginator.count,
                "current_page": self.page.number,
                "total_pages": total_pages,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "ids": ids,
                "results": data,
            }
        )

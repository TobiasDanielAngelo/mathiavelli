from core.viewsets import CustomModelViewSet
from .serializers import *


class ItemToBringViewSet(CustomModelViewSet):
    queryset = ItemToBring.objects.all()
    serializer_class = ItemToBringSerializer


class TravelPlanViewSet(CustomModelViewSet):
    queryset = TravelPlan.objects.all()
    serializer_class = TravelPlanSerializer


class RequirementViewSet(CustomModelViewSet):
    queryset = Requirement.objects.all()
    serializer_class = RequirementSerializer

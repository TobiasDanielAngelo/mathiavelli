from .models import *
from core.serializers import CustomSerializer


class ItemToBringSerializer(CustomSerializer):
    class Meta:
        model = ItemToBring
        fields = "__all__"


class TravelPlanSerializer(CustomSerializer):
    class Meta:
        model = TravelPlan
        fields = "__all__"


class RequirementSerializer(CustomSerializer):
    class Meta:
        model = Requirement
        fields = "__all__"

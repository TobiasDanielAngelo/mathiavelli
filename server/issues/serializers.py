from core.serializers import CustomSerializer
from .models import *


class TicketSerializer(CustomSerializer):
    class Meta:
        model = Ticket
        fields = "__all__"


class TagSerializer(CustomSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class CommentSerializer(CustomSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class NoteSerializer(CustomSerializer):
    class Meta:
        model = Note
        fields = "__all__"


class AppReleaseSerializer(CustomSerializer):
    class Meta:
        model = AppRelease
        fields = "__all__"

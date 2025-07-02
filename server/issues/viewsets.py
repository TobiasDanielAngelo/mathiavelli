from core.viewsets import CustomModelViewSet
from .serializers import *


class TicketViewSet(CustomModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer


class TagViewSet(CustomModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class CommentViewSet(CustomModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class NoteViewSet(CustomModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

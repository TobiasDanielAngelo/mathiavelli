from rest_framework import viewsets
from .models import Journal
from .serializers import JournalSerializer


class JournalViewSet(viewsets.ModelViewSet):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer

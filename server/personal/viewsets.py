from core.viewsets import CustomModelViewSet
from .serializers import *


class JournalViewSet(CustomModelViewSet):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer


class PlatformViewSet(CustomModelViewSet):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer


class CredentialViewSet(CustomModelViewSet):
    queryset = Credential.objects.all()
    serializer_class = CredentialSerializer


class DreamViewSet(CustomModelViewSet):
    queryset = Dream.objects.all()
    serializer_class = DreamSerializer


class DocumentViewSet(CustomModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

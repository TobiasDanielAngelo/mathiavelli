from .models import *
from core.serializers import CustomSerializer


class JournalSerializer(CustomSerializer):
    class Meta:
        model = Journal
        fields = "__all__"


class PlatformSerializer(CustomSerializer):
    class Meta:
        model = Platform
        fields = "__all__"


class CredentialSerializer(CustomSerializer):
    class Meta:
        model = Credential
        fields = "__all__"

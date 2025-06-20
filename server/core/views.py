from django.contrib.auth import authenticate, login
from .serializers import *
from knox.models import AuthToken
from django.contrib.auth.models import User
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, response, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import os


class CustomAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        # AllowAny
    ]
    authentication_classes = [
        TokenAuthentication,
    ]


class LoginAPI(KnoxLoginView):
    serializer_class = LoginSerializer
    permission_classes = [
        permissions.AllowAny,
    ]
    api_view = ["POST", "GET"]

    def get(self, request):
        content = {
            "username": ["This field is required,"],
            "password": ["This field is required,"],
        }
        return response.Response(content)

    def post(self, request, *args, **kwargs):
        user = User.objects.filter(username=request.data.get("username")).first()
        if user != None:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
            _, token = AuthToken.objects.create(user)
            authenticated_user = authenticate(
                request, username=user.username, password=request.data["password"]
            )
            if authenticated_user.is_authenticated:
                data = {
                    "key": token,
                    "user": {
                        "id": -1 if user is None else user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    },
                }
                return response.Response(data)
            else:
                return response.Response(
                    {
                        "error": "Wrong password",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return response.Response(
                {
                    "error": "User does not exist",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class RegistrationAPI(generics.GenericAPIView):
    serializer_class = UserSerializer
    api_view = ["POST", "GET"]

    def upload(self, request):
        uploaded_filename = request.FILES["avatar"].name
        try:
            os.mkdir(settings.STATICFILES_DIRS[0])
        except:
            pass
        full_filename = os.path.join(settings.STATICFILES_DIRS[0], uploaded_filename)
        fout = open(full_filename, "wb+")
        with request.FILES["avatar"] as f:
            fout.write(f.read())
        fout.close()

    def get(self, request):
        return response.Response()

    def post(self, request, *args, **kwargs):
        if request.POST:
            serializer = self.get_serializer(data=self.request.POST.dict())
        else:
            serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if request.FILES:
            Employee.objects.filter(id=user.id).update(
                avatar=f'{settings.STATIC_URL}{request.FILES["avatar"].name}'
            )
            self.upload(request)

        return Response(
            {
                "user": UserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": AuthToken.objects.create(user)[1],
            }
        )


class ReauthAPI(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):
        token_key = request.headers["Authorization"].split(" ")[1][0:15]
        try:
            auth_token = AuthToken.objects.get(token_key=token_key)
        except:
            return response.Response(
                {
                    "error": "Login not recognized",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if auth_token is not None:
            user = User.objects.get(id=auth_token.user_id)
            login(request, user)
            data = {
                "key": request.headers["Authorization"].split(" ")[1],
                "user": {
                    "id": -1 if user is None else user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            }
            return response.Response(data)

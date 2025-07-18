from django.contrib.auth import login
from .serializers import *
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, response, status, generics
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import os
from django.http import JsonResponse
from .viewsets import CustomAuthentication
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})


class CustomAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        # AllowAny
    ]
    authentication_classes = [
        CustomAuthentication,
    ]


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


class CookieLoginView(KnoxLoginView):
    """
    Logs in a user and sets the token in an HTTP-only cookie.
    """

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

    def post(self, request, format=None):
        is_mobile = request.headers.get("X-From-Mobile") == "true"
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        # _, token = AuthToken.objects.create(user)
        login(request, user)
        response = super().post(request, format=None)
        # authenticated_user = authenticate(
        #     request, username=user.username, password=request.data["password"]
        # )
        if user:
            response = super().post(request, format=None)
            token = response.data.get("token")
            expiry = response.data.get("expiry")
            cookie_response = JsonResponse(
                {
                    "key": token if is_mobile else "",
                    "user": {
                        "id": -1 if user is None else user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    },
                }
            )
            cookie_response.set_cookie(
                key="knox_token",
                value=token,
                httponly=True,
                secure=os.environ.get("COOKIE_SECURE_BOOL"),
                samesite="None",
                expires=60 * 60 * 24 * 7,
            )
            return cookie_response
        else:
            return response.Response(
                {
                    "error": "Wrong username/password.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class CookieReauthView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = (CustomAuthentication,)

    def post(self, request):
        # Delete old tokens (optional cleanup)
        AuthToken.objects.filter(user=request.user).delete()

        # Create new token
        instance, token = AuthToken.objects.create(request.user)

        user = request.user  # already fully loaded user

        response = JsonResponse(
            {
                "key": "",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            }
        )
        # Set token in secure cookie
        response.set_cookie(
            key="knox_token",
            value=token,
            httponly=True,
            secure=os.environ.get(
                "COOKIE_SECURE_BOOL"
            ),  # set False for local http, True in prod HTTPS
            samesite="None",  # Lax works better across ports on localhost
            expires=60 * 60 * 24 * 7,
        )
        return response


class CookieLogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (CustomAuthentication,)

    def post(self, request):
        if request._auth:
            request._auth.delete()
            response = Response({"success": True})
            response.delete_cookie("knox_token")
            return response
        else:
            return Response({"success": False})

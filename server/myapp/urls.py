from django.urls import include, path
from rest_framework.routers import DefaultRouter
from knox.views import LogoutView as KnoxLogoutView
from rest_framework.viewsets import ViewSetMixin
import re
import inflect
from . import views
from django.conf import settings
from django.conf.urls.static import static
from . import viewsets as vs_module
from . import analytics as an_module

router = DefaultRouter()

inflector = inflect.engine()


def camel_to_kebab(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()


for attr_name in dir(vs_module):
    viewset = getattr(vs_module, attr_name)

    if isinstance(viewset, type) and issubclass(viewset, ViewSetMixin):
        base = re.sub(r"ViewSet$", "", attr_name)
        if base != "CustomModel":
            kebab = camel_to_kebab(base)
            route = inflector.plural(kebab)
            router.register(route, viewset, basename=route)

for attr_name in dir(an_module):
    viewset = getattr(an_module, attr_name)

    if isinstance(viewset, type) and issubclass(viewset, ViewSetMixin):
        base = re.sub(r"ViewSet$", "", attr_name)
        if base != "":
            kebab = camel_to_kebab(base).replace("-analytics", "")
            route = f"analytics/{inflector.plural(kebab)}"
            router.register(route, viewset, basename=route)


urlpatterns = [
    path("", include(router.urls)),
    path("login", views.LoginAPI.as_view(), name="login"),
    path("signup", views.RegistrationAPI.as_view(), name="register"),
    path("reauth", views.ReauthAPI.as_view(), name="reauth"),
    path("logout", KnoxLogoutView.as_view(), name="logout"),
    path("generate-events", views.GenerateEventsView.as_view(), name="gen_events"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

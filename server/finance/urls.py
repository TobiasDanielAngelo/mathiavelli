from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ViewSetMixin
import re
import inflect
from django.conf import settings
from core.helpers import camel_to_kebab
from django.conf.urls.static import static
from . import viewsets as vs_module
from . import analytics as an_module

router = DefaultRouter()

inflector = inflect.engine()

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
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

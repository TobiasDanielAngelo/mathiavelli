from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ViewSetMixin
import inflect
import re
from core.utils import camel_to_kebab
from django.conf import settings
from django.conf.urls.static import static
from . import viewsets as vs_module

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


urlpatterns = [
    path("", include(router.urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

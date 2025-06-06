from rest_framework.permissions import (
    DjangoModelPermissions,
)
import copy


class CustomDjangoModelPermission(DjangoModelPermissions):

    def __init__(self):
        self.perms_map = copy.deepcopy(self.perms_map)
        self.perms_map["GET"] = ["%(app_label)s.view_%(model_name)s"]

from django.contrib import admin
from .models import *


class JournalAdmin(admin.ModelAdmin):
    model = Journal

    # Show all model fields dynamically in list_display
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


admin.site.register(Journal, JournalAdmin)

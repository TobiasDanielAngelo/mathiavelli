from django.contrib import admin
from .models import *


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    readonly_fields = ("datetimes_display",)

    def get_list_display(self, request):
        return ["datetimes_display"] + [field.name for field in self.model._meta.fields]

    def datetimes_display(self, obj):
        return f"{len(obj.datetimes)} occurences"


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]

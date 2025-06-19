from django.contrib import admin
from .models import *


@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Receivable)
class ReceivableAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Payable)
class PayableAdmin(admin.ModelAdmin):
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


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(BuyListItem)
class BuyListItemAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Credential)
class CredentialAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(WeighIn)
class WeighInAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(BodyFat)
class BodyFatAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(WaistMeasurement)
class WaistMeasurementAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(PersonalItem)
class PersonalItemAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    readonly_fields = ("datetimes_display",)

    def get_list_display(self, request):
        return ["datetimes_display"] + [field.name for field in self.model._meta.fields]

    def datetimes_display(self, obj):
        return "\n".join(str(dt) for dt in obj.datetimes)


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]

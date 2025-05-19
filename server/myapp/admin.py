from django.contrib import admin
from .models import *


class JournalAdmin(admin.ModelAdmin):
    model = Journal

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class AccountAdmin(admin.ModelAdmin):
    model = Account

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class CategoryAdmin(admin.ModelAdmin):
    model = Category

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class TransactionAdmin(admin.ModelAdmin):
    model = Transaction

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class ReceivableAdmin(admin.ModelAdmin):
    model = Receivable

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class PayableAdmin(admin.ModelAdmin):
    model = Payable

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class EventAdmin(admin.ModelAdmin):
    model = Event

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class TagAdmin(admin.ModelAdmin):
    model = Tag

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class GoalAdmin(admin.ModelAdmin):
    model = Goal

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


class TaskAdmin(admin.ModelAdmin):
    model = Task

    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


admin.site.register(Journal, JournalAdmin)
admin.site.register(Account, AccountAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Receivable, ReceivableAdmin)
admin.site.register(Payable, PayableAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Goal, GoalAdmin)
admin.site.register(Task, TaskAdmin)

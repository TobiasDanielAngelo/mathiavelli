from django.db import models
from core import fields


class WeighIn(models.Model):
    weight_kg = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class BodyFat(models.Model):
    body_fat_percent = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class WaistMeasurement(models.Model):
    waist_cm = fields.DecimalField()
    date = fields.AutoCreatedAtField()


class Meal(models.Model):
    MEAL_CATEGORY_CHOICES = [
        (0, "Breakfast"),
        (1, "Lunch"),
        (2, "Dinner"),
        (3, "Snack"),
    ]

    name = fields.MediumCharField()
    category = fields.ChoiceIntegerField(MEAL_CATEGORY_CHOICES)
    calories = fields.DecimalField()
    date = fields.DefaultNowField()


class Workout(models.Model):
    WORKOUT_CATEGORY_CHOICES = [
        (0, "Cardio"),
        (1, "Upper Body"),
        (2, "Lower Body"),
        (3, "Core"),
        (4, "Full Body"),
        (5, "Other"),
    ]

    name = fields.MediumCharField()
    category = fields.ChoiceIntegerField(WORKOUT_CATEGORY_CHOICES)
    duration_minutes = fields.DecimalField()
    calories_burned = fields.DecimalField()
    date = fields.DefaultNowField()

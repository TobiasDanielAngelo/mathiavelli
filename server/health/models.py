from core.models import CustomModel
from core import fields


class WeighIn(CustomModel):
    weight_kg = fields.DecimalField()
    date = fields.DefaultNowField()


class BodyFat(CustomModel):
    body_fat_percent = fields.DecimalField()
    date = fields.DefaultNowField()


class WaistMeasurement(CustomModel):
    waist_cm = fields.DecimalField()
    date = fields.DefaultNowField()


class Meal(CustomModel):
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


class Workout(CustomModel):
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

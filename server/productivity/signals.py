from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import Task, Event, Schedule, Habit, Goal, HabitLog
from django.core.exceptions import ObjectDoesNotExist
from django.utils.timezone import now, get_current_timezone
from dateutil.parser import parse
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import make_aware
from datetime import datetime
from .utils import get_datetimes

# Prevent recursion
_is_syncing = set()

SYNC_FIELDS = [
    "title",
    "description",
    "goal_id",
    "schedule_id",
    "date_start",
    "date_end",
    "date_completed",
    "is_archived",
]

# @receiver(post_save, sender=Model2)  # Model2 is the sender
# def sync_model1_from_model2(sender, instance, **kwargs):
#     # logic to update model1 based on model2 instance
#     ...


def update_goal_completion(goal: Goal):
    tasks = goal.task_goal.all().filter(is_archived=False)
    habits = goal.habit_goal.all().filter(is_archived=False)
    subgoals = goal.goal_parent_goal.all().filter(is_archived=False)

    all_tasks_done = all(t.date_completed for t in tasks)
    all_habits_done = all(h.date_completed for h in habits)
    all_subgoals_done = all(s.date_completed for s in subgoals)

    if all_tasks_done and all_habits_done and all_subgoals_done:
        all_dates = [
            *[t.date_completed for t in tasks if t.date_completed],
            *[h.date_completed for h in habits if h.date_completed],
            *[g.date_completed for g in subgoals if g.date_completed],
        ]
        latest_date = max(all_dates, default=None)

        goal.date_completed = latest_date
    else:
        goal.date_completed = None

    goal.save()


@receiver(post_save, sender=Task)
def sync_goal_from_task(sender, instance, **kwargs):
    if instance.goal:
        update_goal_completion(instance.goal)


@receiver(post_save, sender=Habit)
def sync_goal_from_habit(sender, instance, **kwargs):
    if instance.goal:
        update_goal_completion(instance.goal)


@receiver(post_save, sender=Goal)
def sync_goal_from_goal(sender, instance, **kwargs):
    parent = instance.parent_goal
    if parent:
        update_goal_completion(parent)  # ← already guarded


@receiver(post_save, sender=Habit)
def sync_task_from_habit(sender, instance, **kwargs):
    if not hasattr(instance, "task_habit"):
        # No related Task yet, create one
        Task.objects.create(
            habit=instance,
            **{field: getattr(instance, field, None) for field in SYNC_FIELDS},
            importance=5
        )
        return

    # Sync existing task
    task = instance.task_habit
    updated = False

    for field in SYNC_FIELDS:
        habit_value = getattr(instance, field, None)
        task_value = getattr(task, field, None)
        if habit_value != task_value:
            setattr(task, field, habit_value)
            updated = True

    if updated:
        task.save()


@receiver(post_save, sender=Task)
def sync_habit_from_task(sender, instance, **kwargs):
    if not hasattr(instance, "habit"):
        return

    habit = instance.habit
    updated = False

    for field in SYNC_FIELDS:
        task_value = getattr(instance, field, None)
        habit_value = getattr(habit, field, None)
        if task_value != habit_value:
            setattr(habit, field, task_value)
            updated = True

    if updated:
        habit.save()


@receiver([post_save, post_delete], sender=Event)
def maybe_complete_task(sender, instance, **kwargs):
    try:
        task = instance.task
    except ObjectDoesNotExist:
        return

    if not task or not task.schedule:
        return

    if not task.schedule.count:
        task.date_completed = None
        task.save()
        return

    actual_events = task.event_task.all().filter(is_archived=False)
    tz = get_current_timezone()

    # Parse and normalize expected datetimes (string → datetime with timezone)
    expected_datetimes = set(
        parse(dt).astimezone(tz) for dt in get_datetimes(task.schedule)
    )

    # Normalize actual event datetimes
    actual_datetimes = set(
        e.date_start.astimezone(tz) for e in actual_events if e.date_start
    )

    # 3. Make sure all expected datetimes are covered by events
    if not expected_datetimes.issubset(actual_datetimes):
        task.date_completed = None
        task.save()
        return  # Some events are missing, don't complete yet

    # 4. Check if all events are completed
    if not all(e.date_completed for e in actual_events):
        task.date_completed = None
        task.save()
        return  # Some events not yet done

    # ✅ Mark task as completed
    task.date_completed = now()
    task.save()


@receiver(post_save, sender=Task)
def create_events_for_task(sender, instance, created, **kwargs):
    if created:
        from .utils import generate_missing_events

        generate_missing_events()


@receiver(post_save, sender=Event)
def sync_habitlog_from_event(sender, instance, **kwargs):
    try:
        task = instance.task
    except ObjectDoesNotExist:
        return
    if not task or not task.habit:
        return

    habit = task.habit
    log_date = instance.date_start

    if instance.date_completed:
        # Ensure timezone-aware datetime
        if isinstance(log_date, datetime) and log_date.tzinfo is None:
            log_date = make_aware(log_date)

        HabitLog.objects.get_or_create(
            habit=habit,
            date_created=log_date,
        )
    else:
        HabitLog.objects.filter(
            habit=habit,
            date_created=log_date,
        ).delete()

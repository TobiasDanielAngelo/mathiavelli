"""
Django settings for mysite project.

Generated by 'django-admin startproject' using Django 5.2.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path
import os
from .utils import GET_BOOL, GET_ENV_LIST, LOAD_ENV, GET_ENV
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
LOAD_ENV(BASE_DIR)

SECRET_KEY = GET_ENV("SECRET_KEY")
DEBUG = GET_BOOL("DEBUG", "True")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "knox",
    "core",
    "finance",
    "health",
    "career",
    "personal",
    "productivity",
    "issues",
    "travel",
]
MIDDLEWARE = [
    "core.middleware.CsrfExemptMobileMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "djangorestframework_camel_case.middleware.CamelCaseMiddleWare",
]

ROOT_URLCONF = "mysite.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "mysite.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASS"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Manila"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
MEDIA_URL = "/uploads/"
MEDIA_ROOT = BASE_DIR / "uploads"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.paginations.CustomPagination",
    "PAGE_SIZE": 10,
    "COERCE_DECIMAL_TO_STRING": False,
}
REST_KNOX = {
    "TOKEN_TTL": timedelta(days=int(GET_ENV("COOKIE_EXPIRE_DAYS", "7"))),
}

ALLOWED_HOSTS = GET_ENV_LIST("ALLOWED_HOSTS")
ALLOWED_ORIGINS = GET_ENV_LIST("ALLOWED_ORIGINS")

COOKIE_SECURE = GET_BOOL("COOKIE_SECURE", "True")
COOKIE_SAMESITE = GET_ENV("COOKIE_SAMESITE", "Lax")
COOKIE_HTTPONLY = GET_BOOL("COOKIE_HTTPONLY", "True")
COOKIE_EXPIRE_DAYS = 60 * 60 * 24 * int(GET_ENV("COOKIE_EXPIRE_DAYS", "7"))

SESSION_COOKIE_SECURE = COOKIE_SECURE
SESSION_COOKIE_SAMESITE = COOKIE_SAMESITE

CORS_ALLOWED_ORIGINS = ALLOWED_ORIGINS
CORS_ALLOW_CREDENTIALS = GET_BOOL("CORS_ALLOW_CREDENTIALS", "True")
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "ngrok-skip-browser-warning",
]


CSRF_COOKIE_SECURE = COOKIE_SECURE
CSRF_COOKIE_SAMESITE = COOKIE_SAMESITE
CSRF_TRUSTED_ORIGINS = ALLOWED_ORIGINS

KNOX_COOKIE_HTTPONLY = True
KNOX_COOKIE_SECURE = COOKIE_SECURE
KNOX_COOKIE_SAMESITE = COOKIE_SAMESITE
KNOX_COOKIE_EXPIRE_DAYS = COOKIE_EXPIRE_DAYS

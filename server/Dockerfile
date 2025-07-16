# server/Dockerfile
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Upgrade system packages to patch known CVEs
RUN apt-get update \
    && apt-get install -y build-essential libpq-dev \
    && apt-get clean

# Install Poetry
RUN pip install --upgrade pip
RUN pip install poetry

# Copy only poetry files first for caching
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

ARG RUNNING_IN_DOCKER=1
ENV RUNNING_IN_DOCKER=${RUNNING_IN_DOCKER}

# Copy the rest of your Django app
COPY . .

# Collect static files (adjust path to manage.py if needed)
RUN python manage.py collectstatic --noinput

# Start the server with gunicorn
CMD ["gunicorn", "mysite.wsgi:application", "--bind", "0.0.0.0:8000"]

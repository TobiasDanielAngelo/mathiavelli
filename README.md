July 1, 2025

# 🚀 Mathiavelli App

A **Dockerized full-stack project** with:

- 🐍 Django backend (w/ Postgres)
- ⚛️ React frontend (served by Nginx)
- 🐘 PostgreSQL database
- Managed by Docker Compose for easy replication

---

## ⚠️ Before you start

Make sure you have:

✅ **Docker** installed  
➡️ [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

✅ **Docker Compose** (included with Docker Desktop)  
➡️ [https://docs.docker.com/compose/](https://docs.docker.com/compose/)

## 🚀 Quickstart

### ✅ 1. Clone the repository

```bash
git clone https://github.com/TobiasDanielAngelo/mathiavelli.git
cd mathiavelli
```

### ✅ 2. Setup environment variables

Create your local `.env` file by copying the example:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual values. Example:

```bash
SECRET_KEY=your-django-secret
DATABASE_NAME=yourdb
DATABASE_USER=youruser
DATABASE_PASS=yourpass
DATABASE_HOST=db
DATABASE_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:3000
COOKIE_SECURE_BOOL=False
VITE_BASE_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### ✅ 3. Build and start the containers

Use Docker Compose to build the images and start all services in the background:

```bash
docker compose up -d --build
```

This will:

- Build the React app and bundle it with Nginx
- Build the Django backend with all Python dependencies
- Start the PostgreSQL database
- Connect everything on a private Docker network

### ✅ 4. Run Django database setup

Run the following commands to apply database migrations and collect static files inside the backend container:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py createsuperuser
```

This will:

- Create all necessary database tables
- Gather static assets into the /static folder so they’re served by Nginx
- Create an admin user for backend

### ✅ 5. Access your app in the browser

Once everything is up:

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend  | [http://localhost:8000](http://localhost:8000) |

You can now:

- Visit the frontend in your browser at **http://localhost:3000**
- Access the Django API directly at **http://localhost:8000**

---

February 9, 2025

# Backend Packages

| Package                        | Description                    |
| ------------------------------ | ------------------------------ |
| django                         | Web framework for backend apps |
| djangorestframework            | Build RESTful APIs in Django   |
| django-cors-headers            | Enable CORS in Django          |
| psycopg2                       | PostgreSQL database connector  |
| dotenv                         | Load env vars from `.env` file |
| djangorestframework-camel-case | Convert keys to camelCase      |
| django-rest-knox               | Token auth for DRF             |
| pillow                         | Image processing library       |
| inflect                        | Word pluralizer                |

<pre><code>poetry add django djangorestframework django-cors-headers psycopg2 dotenv djangorestframework-camel-case django-rest-knox pillow </code></pre>

# Frontend

### Runtime Dependencies

| Package               | Purpose                    |
| --------------------- | -------------------------- |
| react                 | Core UI library            |
| react-dom             | React DOM rendering        |
| react-router-dom      | Routing for React          |
| @mui/material         | Material UI components     |
| @mui/icons-material   | Material UI icons          |
| @emotion/react        | Emotion styling lib (core) |
| @emotion/styled       | Emotion styled components  |
| tailwindcss           | Tailwind CSS engine        |
| @tanstack/react-table | Headless table UI logic    |
| react-to-pdf          | Export components as PDFs  |
| react-calendar        | Calendar UI                |
| react-datetime        | Date/time picker           |
| moment                | Date/time utils            |
| mobx                  | State management           |
| mobx-react-lite       | MobX for React             |
| mobx-keystone         | MobX + model architecture  |
| @uidotdev/usehooks    | Ready-to-use React hooks   |

<pre><code>yarn add react react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled tailwindcss @tanstack/react-table react-to-pdf react-calendar react-datetime moment mobx mobx-react-lite mobx-keystone @uidotdev/usehooks</code></pre>

### Dev Dependencies

| Package                     | Purpose                             |
| --------------------------- | ----------------------------------- |
| @eslint/js                  | ESLint’s base config in JS          |
| @testing-library/react      | UI testing utilities                |
| @types/react                | React type definitions              |
| @types/react-dom            | ReactDOM type definitions           |
| @vitejs/plugin-react        | React plugin for Vite               |
| autoprefixer                | Adds vendor prefixes to CSS         |
| eslint                      | JavaScript/TypeScript linter        |
| eslint-plugin-react-hooks   | Lint rules for React hooks          |
| eslint-plugin-react-refresh | Lint support for React Fast Refresh |
| globals                     | Predefined global vars for linting  |
| jsdom                       | Simulated browser for testing       |
| postcss                     | CSS processing engine               |
| prettier                    | Code formatter                      |
| tailwind-scrollbar          | Scrollbar plugin for Tailwind       |
| typescript                  | Type system for JS                  |
| typescript-eslint           | ESLint support for TypeScript       |
| vite                        | Fast bundler/dev server             |
| vitest                      | Unit testing framework              |

```

```

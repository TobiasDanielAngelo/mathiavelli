February 9, 2024

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

# web/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . . 
RUN yarn build

# serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

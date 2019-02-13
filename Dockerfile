FROM nginx:1.15.8
COPY ./dist/plantLogic/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

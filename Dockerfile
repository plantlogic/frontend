FROM nginx:1.18.0
COPY ./dist/plantLogic/ /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/environment-config.sh /home/environment-config.sh

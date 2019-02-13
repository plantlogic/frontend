FROM nginx:1.15.8
COPY --from=build-stage ./dist/plantLogic/ /usr/share/nginx/html
COPY --from=build-stage ./nginx.conf /etc/nginx/conf.d/default.conf

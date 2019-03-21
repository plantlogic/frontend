#!/bin/bash

if [[ -n "${APP_URL}" ]]; then
  export FRONTEND_URL="${APP_URL}"
  export API_URL="${APP_URL}/api"
fi

envsubst '$REDIRECT_URL $FRONTEND_URL $API_URL' < /etc/nginx/conf.d/site.template > /etc/nginx/conf.d/default.conf
envsubst '$API_URL $APP_NAME' < /etc/nginx/conf.d/environment.template > /usr/share/nginx/html/assets/environments/environment.json
exec nginx -g 'daemon off;'

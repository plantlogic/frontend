[![Issues](https://img.shields.io/github/issues/plantlogic/frontend.svg?style=flat)](https://github.com/plantlogic/frontend/issues) [![License](https://img.shields.io/github/license/plantlogic/frontend.svg?style=flat)](https://github.com/plantlogic/frontend/blob/master/LICENSE) [![Docker Pulls](https://img.shields.io/docker/pulls/projectnull4/plantlogic-frontend.svg?style=flat)](https://hub.docker.com/r/projectnull4/plantlogic-frontend)
# 🌱 PlantLogic | Frontend

Dockerized Angular 12 frontend for the PlantLogic application. Developed in collaboration with Merrill Farms.

## Development
To disable authentication (so the frontend can be navigated freely), serve the application with the following configuration:
`ng serve -c disableAuth`

Or to use the demo server's API, run with: `ng serve -c demoServerAPI`

## Docker Environment Variables
* **APP_NAME:** The name of the app, eg. `PlantLogic`
* **REDIRECT_URL:** The URL to redirect to if the server isn't accessed from a valid URL, eg. `example.com`
* **FRONTEND_URL:** The URL to access the frontend at, eg. `example.com`
* **API_URL:** The URL to access the API at, eg. `api.example.com`
* **APP_URL:** This overrides both `FRONTEND_URL` and `API_URL` - if `APP_URL` is set to `example.com`, then `FRONTEND_URL` is set to `example.com` and `API_URL` is set to `example.com/api`


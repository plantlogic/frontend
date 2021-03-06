[![Build Status](https://travis-ci.org/plantlogic/frontend.svg?branch=master)](https://travis-ci.org/plantlogic/frontend) [![Issues](https://img.shields.io/github/issues/plantlogic/frontend.svg?style=flat)](https://github.com/plantlogic/frontend/issues) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/6edf7b48cb7b410bb36936770866e60e)](https://www.codacy.com/app/mattwebbio/frontend?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=plantlogic/frontend&amp;utm_campaign=Badge_Grade) [![License](https://img.shields.io/github/license/plantlogic/frontend.svg?style=flat)](https://github.com/plantlogic/frontend/blob/master/LICENSE) [![Docker Pulls](https://img.shields.io/docker/pulls/plantlogic/frontend.svg?style=flat)](https://hub.docker.com/r/plantlogic/frontend) [![Demo](https://img.shields.io/badge/demo-live-success.svg)](https://demo.plantlogic.org)
# 🌱 PlantLogic | Frontend

Dockerized Angular 7 frontend for the PlantLogic application. Part of our CSUMB Spring 2019 capstone project developed in collaboration with Merrill Farms.

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


import { environment as defaultEnvironment } from './environment';

class EnvironmentClass {
  AppName = defaultEnvironment.AppName;
  ApiUrl = defaultEnvironment.ApiUrl;
  production = defaultEnvironment.production;
  disableAuth = defaultEnvironment.disableAuth;

  set(AppName: string, ApiUrl: string, production: boolean, disableAuth: boolean) {
    this.AppName = AppName;
    this.ApiUrl = ApiUrl;
    this.production = production;
    this.disableAuth = disableAuth;
  }
}

export const environmentLoader = new Promise<EnvironmentClass>((resolve, reject) => {
  const xmlhttp = new XMLHttpRequest();
  const method = 'GET';
  const url = './assets/environments/environment.json';

  xmlhttp.open(method, url, true);
  xmlhttp.onload = () => {
    if (xmlhttp.status === 200) {
      const x: EnvironmentClass = JSON.parse(xmlhttp.responseText);
      resolve(x);
    } else {
      resolve(new EnvironmentClass());
    }
  };
  xmlhttp.send();
});

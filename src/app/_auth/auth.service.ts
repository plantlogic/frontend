import { Router } from '@angular/router';
import { AlertService } from '../_interact/alert/alert.service';
import { BasicDTO } from '../_dto/basicDTO';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthDTO } from '../_dto/auth/auth-dto';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public login(username: string, password: string, rememberMe: boolean): void {
    if (!this.isLoggedIn()) {
      this.http.post<BasicDTO<AuthDTO>>('//' + environment.ApiUrl + '/user/auth/signIn', {username, password}, this.httpOptions)
        .subscribe(
          data => {
            if (data.success) {
              if (data.data.user.passwordReset) {
                sessionStorage.setItem('user_token', JSON.stringify(data.data));
                this.router.navigate(['/resetPassword']);
              } else {
                if (rememberMe) {
                  localStorage.setItem('user_token', JSON.stringify(data.data));
                } else {
                  sessionStorage.setItem('user_token', JSON.stringify(data.data));
                }
                this.router.navigate(['/loginRedirect']);
              }
            } else if (!data.success) {
              AlertService.newBasicAlert('Login Failed: ' + data.error, true);
            }
          },
          failure => {
            AlertService.newBasicAlert('Login Failed: ' + failure.message, true);
          }
        );
    }
  }

  public logout() {
      localStorage.removeItem('user_token');
      sessionStorage.removeItem('user_token');
      this.router.navigate(['/loginRedirect']);
  }

  public isLoggedIn(): boolean {
    if (environment.disableAuth) {
      return true;
    }

    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (!user) {
      return false;
    } else if (Date.parse(user.expiration) <= Date.now()) {
      this.logout();
      AlertService.newBasicAlert('Your session timed out.', true);
      return false;
    } else if (user.user.passwordReset) {
      return false;
    } else {
      return true;
    }
  }

  public isPasswordChangeRequired(): boolean {
    if (environment.disableAuth) {
      return false;
    }

    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (!user) {
      return false;
    } else if (Date.parse(user.expiration) <= Date.now()) {
      this.logout();
      AlertService.newBasicAlert('Your session timed out.', true);
      return false;
    } else if (user.user.passwordReset) {
      return true;
    } else {
      return false;
    }
  }

  public getName(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.user.realName;
    } else {
      return '<No_Name>';
    }
  }

  public getUsername(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.user.username;
    } else {
      return '<No_Username>';
    }
  }

  public getToken(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.token;
    } else {
      return '';
    }
  }

  public validateToken(): Observable<BasicDTO<null>> {
    return this.http.get<BasicDTO<null>>(
      '//' + environment.ApiUrl + '/user/me/tokenValid',
      {headers: new HttpHeaders({'Content-Type': 'application/json', ignoreLoadingBar: ''})}
    );
  }

  public resetPassword(username: string): Observable<BasicDTO<any>> {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/auth/resetPassword', {username}, this.httpOptions);
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
        '//' + environment.ApiUrl + '/user/me/changePassword',
        {oldPassword, newPassword},
        this.httpOptions
    );
  }
}

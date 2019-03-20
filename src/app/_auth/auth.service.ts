import { Router } from '@angular/router';
import { AlertService } from '../_interact/alert.service';
import { BasicDTO } from '../_dto/basicDTO';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthDTO } from '../_dto/auth/auth-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public login(username: string, password: string, rememberMe: boolean): void {
    if (!this.isLoggedIn()) {
      this.http.post<BasicDTO<AuthDTO>>('//' + environment.ApiUrl + '/user/auth/signin', {username, password}, this.httpOptions)
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
              AlertService.newMessage('Login Failed: ' + data.error, true);
            }
          },
          failure => {
            AlertService.newMessage('Login Failed: ' + failure.message, true);
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
      AlertService.newMessage('Your session timed out.', true);
      return false;
    } else if (user.user.passwordReset) {
      return false;
    } else {
      return true;
    }
  }

  public isResetPassword(): boolean {
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
      AlertService.newMessage('Your session timed out.', true);
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

  public resetPassword(username: string) {
    return this.http.post<BasicDTO<any>>('//' + environment.ApiUrl + '/user/auth/resetPassword', {username}, this.httpOptions);
  }


  public changePassword(oldPassword: string, newPassword: string): void {
    this.http.post<BasicDTO<any>>(
        '//' + environment.ApiUrl + '/user/me/changePassword',
        {oldPassword, newPassword},
        this.httpOptions
      ).subscribe(
        data => {
          if (data.success) {
            AlertService.newMessage('Password changed successfully!', false);
            localStorage.removeItem('user_token');
            sessionStorage.removeItem('user_token');
            this.router.navigate(['/']);
          } else if (!data.success) {
            AlertService.newMessage('Change Failed: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newMessage('Change Failed: ' + failure.message, true);
        }
      );
  }
}

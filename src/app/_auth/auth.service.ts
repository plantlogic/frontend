import { Router } from '@angular/router';
import { AlertService } from '../_interact/alert.service';
import { BasicDTO } from '../_dto/basicDTO';
import { User } from './user';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { AuthDTO } from '../_dto/auth/auth-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public login(username: string, password: string, rememberMe: boolean): void {
    this.http.post<BasicDTO<AuthDTO>>('//' + environment.ApiUrl + '/user/auth/signin', {username, password}, this.httpOptions)
      .subscribe(
        data => {
          if (data.success) {
            if (rememberMe) {
              localStorage.setItem('user_token', JSON.stringify(data.data));
            } else {
              sessionStorage.setItem('user_token', JSON.stringify(data.data));
            }
            this.router.navigate(['/']);
          } else if (!data.success) {
            AlertService.newMessage('Login failed: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newMessage('Login failed: ' + failure.message, true);
        }
      );
  }

  public logout() {
      localStorage.removeItem('user_token');
      sessionStorage.removeItem('user_token');
      this.router.navigate(['/']);
  }

  public isLoggedIn() {
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
    } else {
      return true;
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
      return user.name;
    } else {
      return '<No_Name>';
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
}

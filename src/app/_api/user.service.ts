import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BasicDTO } from '../_dto/basicDTO';
import { User } from '../_dto/user/user';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getUserList(): Observable<BasicDTO<User[]>> {
    return this.http.get<BasicDTO<User[]>>('//' + environment.ApiUrl + '/user/management/userList', this.httpOptions);
  }

  public getUserCount(): Observable<BasicDTO<number>> {
    return this.http.get<BasicDTO<number>>('//' + environment.ApiUrl + '/user/management/userCount', this.httpOptions);
  }

  public getUser(username: string, withNonNullPerms: boolean = false): Observable<BasicDTO<User>> {
    return this.http.post<BasicDTO<User>>(
      '//' + environment.ApiUrl + '/user/management/getUser?withNonNullPerms=' + withNonNullPerms,
      {username}, this.httpOptions);
  }

  public addUser(user: User): Observable<BasicDTO<string>> {
    return this.http.post<BasicDTO<string>>('//' + environment.ApiUrl + '/user/management/addUser', user, this.httpOptions);
  }

  public deleteUser(user: User): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/management/deleteUser', user, this.httpOptions);
  }

  public resetPassword(username: string): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/management/resetPassword', {username}, this.httpOptions);
  }

  public editUser(user: User): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/management/editUser', user, this.httpOptions);
  }
}

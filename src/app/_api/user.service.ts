import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BasicDTO } from '../_dto/basicDTO';
import { User } from '../_dto/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getUserList() {
    return this.http.get<BasicDTO<User[]>>('//' + environment.ApiUrl + '/user/management/userlist', this.httpOptions);
  }

  public getUserCount() {
    return this.http.get<BasicDTO<number>>('//' + environment.ApiUrl + '/user/management/userCount', this.httpOptions);
  }

  public addUser(user: User) {
    return this.http.post<BasicDTO<string>>('//' + environment.ApiUrl + '/user/management/addUser', user, this.httpOptions);
  }

  public deleteUser(user: User) {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/management/deleteUser', user, this.httpOptions);
  }
}

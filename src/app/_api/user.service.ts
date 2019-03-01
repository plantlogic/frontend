import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BasicDTO } from '../_dto/basicDTO';
import { User } from '../_auth/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getUserList() {
    return this.http.get<BasicDTO<User[]>>('//' + environment.ApiUrl + '/user/management/userlist', this.httpOptions);
  }
}

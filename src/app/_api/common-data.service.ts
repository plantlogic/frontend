import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getAllData(): Observable<BasicDTO<Array<CommonData<any>>>> {
    return this.http.get<BasicDTO<Array<CommonData<any>>>>(environment.ApiUrl + '/data/common', this.httpOptions);
  }

  public getByKey(key: string): Observable<BasicDTO<Array<CommonData<any>>>> {
    return this.http.get<BasicDTO<Array<CommonData<any>>>>(environment.ApiUrl + '/data/common/' + key, this.httpOptions);
  }

  public updateByKey(data: CommonData<any>): Observable<BasicDTO<Array<CommonData<any>>>> {
    return this.http.put<BasicDTO<Array<CommonData<any>>>>(environment.ApiUrl + '/admin/common', data, this.httpOptions);
  }
}

class CommonData<E> {
  key: string;
  value: E;
}

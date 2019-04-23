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

  public getAllData(): Observable<BasicDTO<Array<CommonData>>> {
    return this.http.get<BasicDTO<Array<CommonData>>>(environment.ApiUrl + '/data/common', this.httpOptions);
  }

  public getByKey(key: string): Observable<BasicDTO<CommonData>> {
    return this.http.get<BasicDTO<CommonData>>(environment.ApiUrl + '/data/common/' + key, this.httpOptions);
  }

  public updateByKey(data: CommonData): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/admin/common', data, this.httpOptions);
  }
}

export class CommonData {
  key: string;
  values: any;
}

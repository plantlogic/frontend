import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Card} from '../_dto/card/card';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardEditService {
  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public updateCard(card: Card): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/edit/ranches/' + card.id, card, this.httpOptions);
  }

  public setCardState(id: string, closed: boolean): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/edit/ranches/' + id + '/state?closed=' + closed,
      null, this.httpOptions);
  }

  public deleteCard(id: string): Observable<BasicDTO<null>> {
    return this.http.delete<BasicDTO<null>>(environment.ApiUrl + '/data/edit/ranches/' + id, this.httpOptions);
  }
}

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Card} from '../_dto/card/card';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';
import {TractorEntry} from '../_dto/card/tractor-entry';
import {IrrigationEntry} from '../_dto/card/irrigation-entry';

@Injectable({
  providedIn: 'root'
})
export class CardEntryService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public createCard(card: Card): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(environment.ApiUrl + '/data/entry/ranches', card, this.httpOptions);
  }

  public getMyCards(): Observable<BasicDTO<Card[]>> {
    return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/entry/ranches', this.httpOptions);
  }

  public getCardById(id: string): Observable<BasicDTO<Card>> {
    return this.http.get<BasicDTO<Card>>(environment.ApiUrl + '/data/entry/ranches/' + id, this.httpOptions);
  }

  public addTractorData(id: string, tractorEntry: TractorEntry): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/tractor',
      tractorEntry, this.httpOptions
    );
  }

  public addIrrigationData(id: string, irrigationEntry: IrrigationEntry): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/irrigation',
      irrigationEntry, this.httpOptions
    );
  }
}

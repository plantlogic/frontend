import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Card} from '../_dto/card/card';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';
import {TractorEntry} from '../_dto/card/tractor-entry';
import {IrrigationEntry} from '../_dto/card/irrigation-entry';
import {Chemicals} from '../_dto/card/chemicals';
import { Comment } from '../_dto/card/comment';

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

  // Remove pre plant chemical input on entry side
  public addChemicalData(id: string, chemicalEntry: Chemicals): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/chemical',
      chemicalEntry, this.httpOptions
    );
  }

  public addWetThinHoeData(id: string, card: Card): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/wet.thin.hoe',
      card, this.httpOptions
    );
  }

  public closeCard(card: Card): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + card.id + '/close',
      card, this.httpOptions
    );
  }

  public setCardComments(id: string, comments: Comment[]): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/entry/ranches/' + id + '/setComments', comments, this.httpOptions);
  }

  // DATA VIEW [Special Case]
  public getShipperCards(shipperID): Observable<BasicDTO<Card[]>> {
    return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/shipperRanches/' + shipperID, this.httpOptions);
  }
  public getDataViewCards(): Observable<BasicDTO<Card[]>> {
    return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches/', this.httpOptions);
  }
}

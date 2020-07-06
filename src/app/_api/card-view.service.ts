import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardViewService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getAllCards(shipperRestricted?: boolean, shipperID?: string): Observable<BasicDTO<Card[]>> {
    if (shipperRestricted && shipperID) {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/shipperRanches/' + shipperID, this.httpOptions);
    } else {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions);
    }
  }

  public getCardsFiltered(shipperRestricted?: boolean, shipperID?: string): Observable<BasicDTO<Card[]>> {
    if (shipperRestricted && shipperID) {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/shipperRanches/' + shipperID, this.httpOptions);
    } else {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions);
    }
  }

  public getCardById(id: string): Observable<BasicDTO<Card>> {
    return this.http.get<BasicDTO<Card>>(environment.ApiUrl + '/data/view/ranches/' + id, this.httpOptions);
  }
}

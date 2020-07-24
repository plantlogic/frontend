import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CommonFormDataService } from './common-form-data.service';
import { CommonLookup } from './common-data.service';
import { DbFilter } from '../_dto/card/dbFilter';
import { DbFilterResponse } from '../_dto/card/dbFilterResponse';

@Injectable({
  providedIn: 'root'
})
export class CardViewService {

  constructor(private http: HttpClient, public common: CommonFormDataService) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getAllCards(shipperRestricted?: boolean, shipperID?: string): Observable<BasicDTO<Card[]>> {
    if (shipperRestricted && shipperID) {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/shipperRanches/' + shipperID, this.httpOptions);
    } else {
      return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions);
    }
  }

  public getCardsFiltered(filter: DbFilter, shipperRestricted: boolean, shipperID?: string): Observable<BasicDTO<DbFilterResponse>> {
    if (shipperRestricted) {
      return this.http.post<BasicDTO<DbFilterResponse>>(environment.ApiUrl + '/data/view/shipperRanchesFiltered/'
                                                       + shipperID, filter, this.httpOptions);
    } else {
      return this.http.post<BasicDTO<DbFilterResponse>>(environment.ApiUrl + '/data/view/ranchesFiltered', filter, this.httpOptions);
    }
  }

  public getCardById(id: string): Observable<BasicDTO<Card>> {
    return this.http.get<BasicDTO<Card>>(environment.ApiUrl + '/data/view/ranches/' + id, this.httpOptions);
  }

  public getUniqueRanches(): Observable<BasicDTO<string[]>> {
    return this.http.get<BasicDTO<string[]>>(environment.ApiUrl + '/data/view/uniqueRanchList', this.httpOptions);
  }

  public getUniqueCommodities(): Observable<BasicDTO<string[]>> {
    return this.http.get<BasicDTO<string[]>>(environment.ApiUrl + '/data/view/uniqueCommodityList', this.httpOptions);
  }
}

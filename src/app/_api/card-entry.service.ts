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
import { DbFilter } from '../_dto/card/dbFilter';
import { DbFilterResponse } from '../_dto/card/dbFilterResponse';

@Injectable({
  providedIn: 'root'
})
export class CardEntryService {

  constructor(private http: HttpClient) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public addChemicalData(id: string, chemicalEntry: Chemicals): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/chemical',
      chemicalEntry, this.httpOptions
    );
  }

  public addIrrigationData(id: string, irrigationEntry: IrrigationEntry): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/irrigation',
      irrigationEntry, this.httpOptions
    );
  }

  public addTractorData(id: string, tractorEntry: TractorEntry): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/tractor',
      tractorEntry, this.httpOptions
    );
  }

  public addWetDate(id: string, wetDate: Date): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + id + '/wetDate',
      wetDate, this.httpOptions
    );
  }

  public closeCard(card: Card): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(
      environment.ApiUrl + '/data/entry/ranches/' + card.id + '/close',
      card, this.httpOptions
    );
  }

  public createCard(card: Card): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(environment.ApiUrl + '/data/entry/ranches', card, this.httpOptions);
  }

  public getCardById(id: string): Observable<BasicDTO<Card>> {
    return this.http.get<BasicDTO<Card>>(environment.ApiUrl + '/data/entry/ranches/' + id, this.httpOptions);
  }

  public getMyCards(): Observable<BasicDTO<Card[]>> {
    return this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/entry/ranches', this.httpOptions);
  }

  public getMyCardsFiltered(filter: DbFilter): Observable<BasicDTO<DbFilterResponse>> {
    return this.http.post<BasicDTO<DbFilterResponse>>(environment.ApiUrl + '/data/entry/ranchesFiltered', filter, this.httpOptions);
  }

  public setCardComments(id: string, comments: Comment[]): Observable<BasicDTO<null>> {
    return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/entry/ranches/' + id + '/setComments', comments, this.httpOptions);
  }

  /* Chart Data */
  public getCardCount(permission, shipperId?: string): Observable<BasicDTO<number>> {
    switch (permission) {
      case 'entry':
        return this.http.get<BasicDTO<number>>(environment.ApiUrl + '/data/entry/count/', this.httpOptions);
      case 'shipper':
          return this.http.get<BasicDTO<number>>(environment.ApiUrl + '/data/view/count/' + shipperId, this.httpOptions);
      case 'view': default:
        return this.http.get<BasicDTO<number>>(environment.ApiUrl + '/data/view/count/', this.httpOptions);
    }
  }

  public getCommodityAcres(permission?: string, shipperId?: string): Observable<BasicDTO<Map<string, number>>> {
    switch (permission) {
      case 'entry':
        return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl + '/data/entry/commodityAcreCount/', this.httpOptions);
      case 'shipper':
          return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl +
                                                              '/data/view/commodityAcreCount/' + shipperId, this.httpOptions);
      case 'view': default:
        return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl + '/data/view/commodityAcreCount/', this.httpOptions);
    }
  }

  public getCommodityCardCount(permission?: string, shipperId?: string): Observable<BasicDTO<Map<string, number>>> {
    switch (permission) {
      case 'entry':
        return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl + '/data/entry/commodityCardCount/', this.httpOptions);
      case 'shipper':
          return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl +
                                                              '/data/view/commodityCardCount/' + shipperId, this.httpOptions);
      case 'view': default:
        return this.http.get<BasicDTO<Map<string, number>>>(environment.ApiUrl + '/data/view/commodityCardCount/', this.httpOptions);
    }
  }

  public getRecentlyHarvested(permission?: string, shipperId?: string): Observable<BasicDTO<Array<number>>> {
    switch (permission) {
      case 'entry':
        return this.http.get<BasicDTO<Array<number>>>(environment.ApiUrl + '/data/entry/recentlyHarvestedCount/', this.httpOptions);
      case 'shipper':
        return this.http.get<BasicDTO<Array<number>>>(environment.ApiUrl +
                                                      '/data/view/recentlyHarvestedCount/' + shipperId, this.httpOptions);
      case 'view': default:
        return this.http.get<BasicDTO<Array<number>>>(environment.ApiUrl + '/data/view/recentlyHarvestedCount/', this.httpOptions);
    }
  }
}

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../_auth/auth.service';
import {PlRole} from '../_dto/user/pl-role.enum';
import {AlertService} from '../_interact/alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public getAllData(): Observable<BasicDTO<Array<CommonData>>> {
    return this.http.get<BasicDTO<Array<CommonData>>>(environment.ApiUrl + '/data/common', this.httpOptions);
  }

  public getByKey(key: string): Observable<BasicDTO<CommonData>> {
    return this.http.get<BasicDTO<CommonData>>(environment.ApiUrl + '/data/common/' + key, this.httpOptions);
  }

  public updateByKey(data: CommonData): Observable<BasicDTO<null>> {
    if (this.auth.hasPermission(PlRole.APP_ADMIN)) {
      return this.http.put<BasicDTO<null>>(environment.ApiUrl + '/data/admin/common', data, this.httpOptions);
    } else {
      AlertService.newBasicAlert('You don\'t have permission to edit this information.', true);
    }
  }
}

export class CommonData {
  key: string;
  values: any;
}

export const CommonLookup = {
  bedTypes: {
    name: 'Bed Types',
    sort: true,
    type: 'text'
  },
  chemicalRateUnits: {
    name: 'Chemical Rate Units',
    sort: true,
    type: 'text'
  },
  chemicals: {
    name: 'Chemicals',
    sort: false,
    type: 'text'
  },
  commodities: {
    name: 'Commodities',
    sort: true,
    type: 'hashTable'
  },
  fertilizers: {
    name: 'Fertilizers',
    sort: false,
    type: 'text'
  },
  irrigationMethod: {
    name: 'Irrigation Method',
    sort: true,
    type: 'text'
  },
  irrigators: {
    name: 'Irrigators',
    sort: true,
    type: 'text'
  },
  ranches: {
    name: 'Ranches',
    sort: true,
    type: 'text'
  },
  // shippers: {
  //   name: 'Shippers',
  //   sort: true,
  //   type: 'text'
  // },
  tractorOperators: {
    name: 'Tractor Operators',
    sort: true,
    type: 'text'
  },
  tractorWork: {
    name: 'Tractor Work',
    sort: true,
    type: 'text'
  }
};

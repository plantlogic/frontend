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
    ranches: {
      name: 'Ranches',
      type: 'text'
    },
    fertilizers: {
      name: 'Fertilizers',
      type: 'text'
    },
    chemicals: {
      name: 'Chemicals',
      type: 'text'
    },
    chemicalRateUnits: {
      name: 'Chemical Rate Units',
      type: 'text'
    },
    irrigationMethod: {
      name: 'Irrigation Method',
      type: 'text'
    },
    tractorOperators: {
      name: 'Tractor Operators',
      type: 'text'
    },
    tractorWork: {
      name: 'Tractor Work',
      type: 'text'
    },
    bedTypes: {
      name: 'Bed Types',
      type: 'text'
    },
    commodities: {
      name: 'Commodities',
      type: 'hashTable'
    }
};

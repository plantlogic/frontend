import {Injectable} from '@angular/core';
import {CommonDataService, CommonLookup} from './common-data.service';

@Injectable({
  providedIn: 'root'
})
export class CommonFormDataService {
  private static common = {};
  private static timestamp;

  constructor(private commonService: CommonDataService) {}

  public getValues(key: string): Array<string> {
    if (!CommonFormDataService.timestamp || CommonFormDataService.timestamp < Date.now() - (1000 * 60 * 30)) {
      CommonFormDataService.timestamp = Date.now();
      this.commonService.getAllData().subscribe(data => {
        if (data.success) {
          data.data.forEach(a => {
            // Simple Tables
            if (CommonLookup[a.key].type === 'text' || CommonLookup[a.key].type === 'number') {
              CommonFormDataService.common[a.key] = [];
              if (a.values && a.values.length > 0) {
                (a.values as Array<string>).forEach(v => CommonFormDataService.common[a.key].push(v));
              }
            } else {
              // Complex
            }

            return CommonFormDataService.common[key];
          });
        } else {
          CommonFormDataService.timestamp = undefined;
          return this.getValues(key);
        }
      }, failure => {
        CommonFormDataService.timestamp = undefined;
        return this.getValues(key);
      });
    } else {
      return CommonFormDataService.common[key];
    }
  }
}

import {Injectable} from '@angular/core';
import {CommonDataService, CommonLookup} from './common-data.service';

@Injectable({
  providedIn: 'root'
})
export class CommonFormDataService {
  private static common = {};
  private static timestamp;

  constructor(private commonService: CommonDataService) {}

  public getValues(key: string, f?) {
    if (!CommonFormDataService.timestamp
        || CommonFormDataService.timestamp < Date.now() - (1000 * 1 * 30)
        || !CommonFormDataService.common[key]) {
      CommonFormDataService.timestamp = Date.now();
      this.commonService.getByKey(key).subscribe(data => {
        if (data.success) {
          CommonFormDataService.common[key] = data.data.values;
          return (f) ? f(CommonFormDataService.common[key]) : CommonFormDataService.common[key];
        } else {
          CommonFormDataService.timestamp = undefined;
          return this.getValues(key);
        }
      }, failure => {
        CommonFormDataService.timestamp = undefined;
        return this.getValues(key);
      });
    } else {
      return (f) ? f(CommonFormDataService.common[key]) : CommonFormDataService.common[key];
    }
  }

  public getAllValues(f?) {
    if (!CommonFormDataService.timestamp || CommonFormDataService.timestamp < Date.now() - (1000 * 1 * 30)) {
      CommonFormDataService.timestamp = Date.now();
      this.commonService.getAllData().subscribe(data => {
        if (data.success) {
          data.data.forEach(c => {
            CommonFormDataService.common[c.key] = c.values;
          });
          return (f) ? f(CommonFormDataService.common) : CommonFormDataService.common;
        } else {
          CommonFormDataService.timestamp = undefined;
          return this.getAllValues();
        }
      }, failure => {
        CommonFormDataService.timestamp = undefined;
        return this.getAllValues();
      });
    } else {
      return (f) ? f(CommonFormDataService.common) : CommonFormDataService.common;
    }
  }

  public getMapKeys(key: string): Array<string> {
    return Object.keys(this.getValues(key));
  }

  public getMapValues(key: string, mapKey: string): Array<string> {
    return this.getValues(key)[mapKey];
  }

  // Compare function for sorting objects with hash tables as values
  public compareHashTableText(a, b): number {
    let comparison = 0;
    const valA = a.value.key.toUpperCase();
    const valB = b.value.key.toUpperCase();
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  // Compare function for sorting objects with numbers as values
  public compareSimpleNumber(a, b): number {
    let comparison = 0;
    const valA = Number(a.value);
    const valB = Number(b.value);
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  // Compare function for sorting objects with text as values
  public compareSimpleText(a, b): number {
    let comparison = 0;
    const valA = a.value.toUpperCase();
    const valB = b.value.toUpperCase();
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  // Sort function which sorts the array based on its CommonLookup properties
  public sortCommonArray(arr: any[], key: string): any[] {
    if (CommonLookup[key].sort === false) { return arr; }
    const type = (CommonLookup[key] && CommonLookup[key].type) ? CommonLookup[key].type : 'text';
    if (type === 'text') {
      return arr.sort(this.compareSimpleText);
    } else if (type === 'number') {
      return arr.sort(this.compareSimpleNumber);
    } else if (type === 'hashTable') {
      return arr.sort(this.compareHashTableText);
    }
    return arr;
  }
}

import {Component, OnInit, EventEmitter} from '@angular/core';
import {TitleService} from 'src/app/_interact/title.service';
import {CommonData, CommonDataService, CommonLookup} from '../../_api/common-data.service';
import {AlertService} from '../../_interact/alert/alert.service';
import { ObjectID } from 'bson';
import { Alert } from 'src/app/_interact/alert/alert';


@Component({
  selector: 'app-admin',
  templateUrl: './app-admin.component.html',
  styleUrls: ['./app-admin.component.scss']
})
export class AppAdminComponent implements OnInit {
  constructor(private titleService: TitleService, private commonData: CommonDataService) { }
  keys = [];
  commonArray = [];
  sortedCommonArray = [];
  displayToggles = {};

  ngOnInit() {
    this.titleService.setTitle('Administration');
    this.commonData.getAllData().subscribe(data => {
      if (data.success) {
        this.keys = Object.keys(CommonLookup);
        this.commonArray = data.data;
        this.sortedCommonArray = this.getSortedData();
        this.keys.forEach(key => {
          this.displayToggles[key] = true;
        });
      } else if (!data.success) {
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    }, failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }

  public addCommonFromInput(key: string): void {
    const newValue = (document.getElementById(key + 'NewValue') as HTMLInputElement).value;
    const newCommon = {id: (new ObjectID()).toHexString()};
    if (CommonLookup[key].type === 'hashTable') {
      newCommon[`value`] = {key: newValue, value: []};
    } else {
      newCommon[`value`] = newValue;
    }

    const keyIndex = this.sortedCommonArray.findIndex(e => e.key === key);
    if (keyIndex >= 0) {
      this.sortedCommonArray[keyIndex].values.push(newCommon);
    }
    this.updateCommon(key);
    (document.getElementById(key + 'NewValue') as HTMLInputElement).value = '';
  }

  public addSubValue(key: string, c, displayIndex: number): void {
    const newValue = (document.getElementById(key + 'NewSubValue' + displayIndex) as HTMLInputElement).value;
    const keyIndex = this.sortedCommonArray.findIndex(e => e.key === key);
    const valueIndex = this.sortedCommonArray[keyIndex].values.findIndex(v => v.id === c.id);
    this.sortedCommonArray[keyIndex].values[valueIndex].value.value.push(newValue);
    this.updateCommon(key);
    (document.getElementById(key + 'NewSubValue' + displayIndex) as HTMLInputElement).value = '';
  }

  // Compare function for sorting objects with hash tables as values
  private compareHashTableText(a, b): number {
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
  private compareSimpleNumber(a, b): number {
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
  private compareSimpleText(a, b): number {
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

  // Returns an array of {id, value} for type key + (reformats hashTables for ease of use)
  private getCommonValuesArray(key: string): Array<any> {
    try {
      const common = this.commonArray.filter(c => c.key === key)[0];
      if (!common) { return []; }
      const commonValues = common.values;
      if (this.getLookupType(key) === 'hashTable') {
        const arr = [];
        commonValues.forEach(entry => {
          arr.push({
            id: entry.id,
            value : {
              key : Object.keys(entry.value)[0],
              value: entry.value[Object.keys(entry.value)[0]]
            }
          });
        });
        return arr;
      }
      return commonValues;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // Gets sorted data whose CommonLookup data match parameters
  public getData(isHashTable: boolean, sort: boolean): Array<any> {
    return this.sortedCommonArray.filter(e => {
      return (CommonLookup[e.key].sort === sort) && ((CommonLookup[e.key].type === 'hashTable') === isHashTable);
    });
  }

  // Retrieves the lookup name for a key (better for display)
  public getLookupName(key: string): string {
    return (CommonLookup[key] && CommonLookup[key].name) ? CommonLookup[key].name : key;
  }

  // Retrieves the lookup type for a key
  public getLookupType(key: string): string {
    return (CommonLookup[key] && CommonLookup[key].type) ? CommonLookup[key].type : 'text';
  }

  /*
    Returns an array of arrays
    The outer array is sorted common keys (e.g. commodities, ranches, etc...)
    The inner array is an array of objects sorted by the object.value compare function
  */
  private getSortedData(): Array<any> {
    const commonSorted = [];
    this.keys.sort().forEach(key => {
      commonSorted.push({
        key,
        values: this.sortCommonArray(this.getCommonValuesArray(key), key)
      });
    });
    return commonSorted;
  }

  public isHidden(s: string): boolean {
    return this.displayToggles[s];
  }

  public removeCommon(key: string, value): void {
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Delete Common Data';
    newAlert.message = `This will permanently remove: ` +
                       `${(CommonLookup[key].type === 'hashTable') ? value.value[Object.keys(value.value)[0]] : value.value}` +
                       ` from ${CommonLookup[key].name}. Are you sure?`;
    newAlert.actionName = 'Delete';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();

    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      const keyIndex = this.sortedCommonArray.findIndex(e => e.key === key);
      if (keyIndex >= 0) {
        this.sortedCommonArray[keyIndex].values = this.sortedCommonArray[keyIndex].values.filter(v => {
          return v.id !== value.id;
        });
      }
      this.updateCommon(key);
    });
    AlertService.newAlert(newAlert);
  }

  public removeSubValue(key: string, c, valToDelete): void {
    const keyIndex = this.sortedCommonArray.findIndex(e => e.key === key);
    const valueIndex = this.sortedCommonArray[keyIndex].values.findIndex(v => v.id === c.id);
    const oldValues = this.sortedCommonArray[keyIndex].values[valueIndex].value.value;
    this.sortedCommonArray[keyIndex].values[valueIndex].value.value = oldValues.filter(v => {
      return v !== valToDelete;
    });
    this.updateCommon(key);
  }

  public shiftDown(key: string, value): void {
    const keyIndex = this.sortedCommonArray.findIndex(c => c.key === key);
    const keyValuesLength = this.sortedCommonArray[keyIndex].values.length;
    const oldValueIndex = this.sortedCommonArray[keyIndex].values.findIndex(v => v.id === value.id);
    if (oldValueIndex >= keyValuesLength - 1) { return; }
    const desiredValueIndex = oldValueIndex + 1;
    const copy = this.sortedCommonArray[keyIndex].values[desiredValueIndex];
    this.sortedCommonArray[keyIndex].values[desiredValueIndex] = value;
    this.sortedCommonArray[keyIndex].values[oldValueIndex] = copy;
    this.updateCommon(key);
  }

  public shiftUp(key: string, value): void {
    const keyIndex = this.sortedCommonArray.findIndex(c => c.key === key);
    const oldValueIndex = this.sortedCommonArray[keyIndex].values.findIndex(v => v.id === value.id);
    if (oldValueIndex <= 0) { return; }
    const desiredValueIndex = oldValueIndex - 1;
    const copy = this.sortedCommonArray[keyIndex].values[desiredValueIndex];
    this.sortedCommonArray[keyIndex].values[desiredValueIndex] = value;
    this.sortedCommonArray[keyIndex].values[oldValueIndex] = copy;
    this.updateCommon(key);
  }

  // Sort function which sorts the array based on its CommonLookup properties
  private sortCommonArray(arr: any[], key: string): any[] {
    if (CommonLookup[key].sort === false) { return arr; }
    const type = this.getLookupType(key);
    if (type === 'text') {
      return arr.sort(this.compareSimpleText);
    } else if (type === 'number') {
      return arr.sort(this.compareSimpleNumber);
    } else if (type === 'hashTable') {
      return arr.sort(this.compareHashTableText);
    }
    return arr;
  }

  public toggleDisplay(s: string): void {
    this.displayToggles[s] = !this.displayToggles[s];
  }

  public updateCommon(key: string): void {
    const arr = this.sortedCommonArray.filter(e => e.key === key)[0].values;
    let valuesToSend = [];
    if (CommonLookup[key].type === 'hashTable') {
      arr.forEach(e => {
        const copy = { ...e};
        const temp = {};
        temp[copy[`value`][`key`]] = copy[`value`][`value`];
        copy[`value`] = temp;
        valuesToSend.push(copy);
      });
    } else {
      valuesToSend = arr;
    }
    const val: CommonData = new CommonData();
    val.key = key;
    val.values = valuesToSend;
    this.commonData.updateByKey(val).subscribe(data => {
      if (!data.success) {
        AlertService.newBasicAlert('There was a client error saving the change: ' + data.error, true, 10);
      } else {
        // Re-sort common display at specified key to reflect updated values
        const keyIndex = this.sortedCommonArray.findIndex(e => e.key === key);
        if (keyIndex >= 0) {
          this.sortedCommonArray[keyIndex].values = this.sortCommonArray(this.sortedCommonArray[keyIndex].values, key);
        }
      }
    }, failure => {
      AlertService.newBasicAlert('There was a connection error while saving the changes: ' + failure.message + ' (Try Again)', true, 10);
    });
  }
}

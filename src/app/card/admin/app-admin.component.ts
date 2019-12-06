import {Component, OnInit} from '@angular/core';
import {TitleService} from 'src/app/_interact/title.service';
import {CommonData, CommonDataService, CommonLookup} from '../../_api/common-data.service';
import {AlertService} from '../../_interact/alert/alert.service';

@Component({
  selector: 'app-admin',
  templateUrl: './app-admin.component.html',
  styleUrls: ['./app-admin.component.scss']
})
export class AppAdminComponent implements OnInit {
  constructor(private titleService: TitleService, private commonData: CommonDataService) { }
  common = {};
  emptyEntries = undefined;
  entries = {};
  keys: Array<string> = new Array<string>();
  commodities = {};

  ngOnInit() {
    this.titleService.setTitle('Administration');

    this.commonData.getAllData().subscribe(data => {
      if (data.success) {
        data.data.forEach(a => {
          if (CommonLookup[a.key].type === 'text' || CommonLookup[a.key].type === 'number') {
            // Simple Tables
            this.entries[a.key] = '';

            this.common[a.key] = [];
            if (a.values && a.values.length > 0) {
              (a.values as Array<string>).forEach(v => this.common[a.key].push(v));
            }
          } else if (CommonLookup[a.key].type === 'hashTable') {
            // Hash Table
            this.entries[a.key] = {
              category: '',
              varieties: {}
            };
            Object.keys(a.values).forEach(v => this.entries[a.key].varieties[v] = '');

            this.common[a.key] = a.values;
          }

          this.keys.push(a.key);
        });

        this.emptyEntries = JSON.parse(JSON.stringify(this.entries));
      } else if (!data.success) {
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    }, failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }


  private getSimpleTables(): Array<string> {
    return this.keys.filter(v => CommonLookup[v].type === 'text' || CommonLookup[v].type === 'number');
  }


  private getHashTables(): Array<string> {
    return this.keys.filter(v => CommonLookup[v].type === 'hashTable');
  }


  private getName(key: string): string {
    if (CommonLookup[key] && CommonLookup[key].name) {
      return CommonLookup[key].name;
    } else {
      return key;
    }
  }

  private getType(key: string): string {
    if (CommonLookup[key] && CommonLookup[key].type) {
      return CommonLookup[key].type;
    } else {
      return 'text';
    }
  }

  private getKeys(o: any): Array<Object> {
    return Object.keys(o);
  }


  private removeElement(key: string, pub: any, arr: Array<string>, index: number): void {
    arr.splice(index, 1);

    this.publishChange(key, pub);
  }

  private updateElement(key: string, pub: any, arr: Array<string>, index: number, newValue: any): void {
    arr[index] = newValue;
    this.publishChange(key, pub);
  }

  private updateHashElement(key: string, pub: any, arr: Array<string>, index: number, newKey: string): void {
    console.log("Would update commodity (Hashtable)");
    console.log("Key");
    console.log(key);
    console.log("pub");
    console.log(pub);
    console.log("arr");
    console.log(arr);
    console.log("index");
    console.log(index);
    console.log("Object.keys(arr)[index]");
    console.log(Object.keys(arr)[index])
    console.log("newValue (key)");
    console.log(newKey);

    let oldKey = Object.keys(arr)[index];
    if(oldKey !== newKey) {
      let oldValue = arr[oldKey];
      arr[newKey] = oldValue;
      //delete old key
      delete arr[oldKey];
      this.publishChange(key, pub);
      this.clearEntries();
    }
  }

  private shiftUp(key: string, pub: any, arr: Array<string>, index: number): void {
    const copy = arr[index - 1];
    arr[index - 1] = arr[index];
    arr[index] = copy;

    this.publishChange(key, pub);
  }

  private shiftDown(key: string, pub: any, arr: Array<string>, index: number): void {
    const copy = arr[index + 1];
    arr[index + 1] = arr[index];
    arr[index] = copy;

    this.publishChange(key, pub);
  }

  private addElement(key: string, pub: any, arr: Array<string>, value: string, sort: boolean = false): void {
    if (value) {
      arr.push(value);

      if (sort) {
        arr.sort();
      }

      this.publishChange(key, pub);
      this.clearEntries();
    }
  }

  private addHashCategory(key: string, pub: any, obj: any, value: string): void {
    if (value && !obj[value]) {
      obj[value] = new Array<string>();

      this.publishChange(key, pub);
      this.clearEntries();
    }
  }

  private popHashCategory(key: string, pub: any, obj: any, index: number): void {
    let value = Object.keys(obj)[index];
    if (value) {
      delete obj[value];

      this.publishChange(key, pub);
    }
  }

  private clearEntries(): void {
    this.entries = JSON.parse(JSON.stringify(this.emptyEntries));
  }

  private publishChange(key: string, pub: any): void {
    const val: CommonData = new CommonData();
    val.key = key;
    val.values = pub;

    this.commonData.updateByKey(val).subscribe(data => {
      if (!data.success) {
        AlertService.newBasicAlert('There was a client error saving the change: ' + data.error, true, 10);
      }
    }, failure => {
      AlertService.newBasicAlert('There was a connection error while saving the changes: ' + failure.message + ' (Try Again)', true, 10);
    });
  }
}

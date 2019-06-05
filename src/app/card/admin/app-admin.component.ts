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
  entries = {};
  keys: Array<string> = new Array<string>();
  commodities = {};

  ngOnInit() {
    this.titleService.setTitle('Administration');

    this.commonData.getAllData().subscribe(data => {
      if (data.success) {
        data.data.forEach(a => {
          // Simple Tables
          if (CommonLookup[a.key].type === 'text' || CommonLookup[a.key].type === 'number') {
            this.common[a.key] = [];
            this.entries[a.key] = '';
            if (a.values && a.values.length > 0) {
              (a.values as Array<string>).forEach(v => this.common[a.key].push(v));
            }
            this.keys.push(a.key);
          } else {
            // Complex
          }
        });
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


  /* private getHashTables(): Array<string> {

  } */


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


  private removeElement(key: string, arr: Array<string>, index: number): void {
    arr.splice(index, 1);

    this.publishChange(key, arr);
  }

  private shiftUp(key: string, arr: Array<string>, index: number): void {
    const copy = arr[index - 1];
    arr[index - 1] = arr[index];
    arr[index] = copy;

    this.publishChange(key, arr);
  }

  private shiftDown(key: string, arr: Array<string>, index: number): void {
    const copy = arr[index + 1];
    arr[index + 1] = arr[index];
    arr[index] = copy;

    this.publishChange(key, arr);
  }

  private addElement(key: string, arr: Array<string>, value: string): void {
    if (value) {
      arr.push(value);
      this.entries[key] = '';

      this.publishChange(key, arr);
    }
  }

  private publishChange(key: string, arr: Array<string>): void {
    const val: CommonData = new CommonData();
    val.key = key;
    val.values = arr;

    this.commonData.updateByKey(val).subscribe(data => {
      if (!data.success) {
        AlertService.newBasicAlert('There was a client error saving the change: ' + data.error, true, 10);
      }
    }, failure => {
      AlertService.newBasicAlert('There was a connection error while saving the changes: ' + failure.message + ' (Try Again)', true, 10);
    });
  }
}

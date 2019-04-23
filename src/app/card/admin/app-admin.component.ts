import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/_interact/title.service';
import {CommonData, CommonDataService} from '../../_api/common-data.service';
import {AlertService} from '../../_interact/alert/alert.service';
import { BehaviorSubject } from 'rxjs';

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
  lookup = {
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
    tractorOperators: {
      name: 'Tractor Operators',
      type: 'text'
    },
    bedTypes: {
      name: 'Bed Types',
      type: 'number'
    },
    bedCounts: {
      name: 'Bed Counts',
      type: 'number'
    },
    commodities: {
      name: 'Commodities',
      type: 'text'
    }
  };

  ngOnInit() {
    this.titleService.setTitle('Administration');

    this.commonData.getAllData().subscribe(data => {
      if (data.success) {
        data.data.forEach(a => {
          if (a.key === 'commodities') {
            // ignore
          } else {
            this.common[a.key] = [];
            this.entries[a.key] = '';
            if (a.values) {
              (a.values as Array<string>).forEach(v => this.common[a.key].push(v));
            }
            this.keys.push(a.key);
          }
        });
      } else if (!data.success) {
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    }, failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }


  private getName(key: string): string {
    if (this.lookup[key] && this.lookup[key].name) {
      return this.lookup[key].name;
    } else {
      return key;
    }
  }

  private getType(key: string): string {
    if (this.lookup[key] && this.lookup[key].type) {
      return this.lookup[key].type;
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
      AlertService.newBasicAlert('THere was a connection error while saving the changes: ' + failure.message + ' (Try Again)', true, 10);
    });
  }
}

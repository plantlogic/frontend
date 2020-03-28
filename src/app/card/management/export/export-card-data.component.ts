import {CommonFormDataService} from './../../../_api/common-form-data.service';
import {Component, OnInit} from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardViewService} from '../../../_api/card-view.service';
import {NavService} from '../../../_interact/nav.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { AuthService } from 'src/app/_auth/auth.service';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardExport: CardExportService, public cardService: CardViewService,
              private nav: NavService, public common: CommonFormDataService, private auth: AuthService) {}

  loading = true;
  generating = false;

  fromDate: number = Date.now();
  toDate: number = Date.now();
  includeUnharvested = false;

  selectedRanches = [];
  selectedCommodities = [];

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  multiselectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['commodities'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Export Data');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
    });
  }

  generate(): void {
    this.generating = true;
    this.fromDate = (new Date(this.fromDate)).valueOf();
    this.toDate = (new Date(this.toDate)).valueOf();
    const ranchIDS = this.selectedRanches.map(e => e.id);
    const commodityIDS = this.selectedCommodities.map(e => e.id);
    this.cardExport.export(this.fromDate, this.toDate, ranchIDS, commodityIDS, this.includeUnharvested);
    this.generating = false;
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return this[key];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
        if (CommonLookup[key].type === 'hashTable') {
          const temp = [];
          data[key].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[key] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
        }
      });
      sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  private loadCardData() {
    const tempThis = this;
    const ranchList = [];
    const commodityList = [];
    this.cardService.getAllCards().subscribe(
      data => {
        if (data.success) {
          data.data.map(c => (new Card()).copyConstructor(c)).forEach(c => {

            // Get all ranch names
            if (!ranchList.find(e => e.id === c.ranchName)) {
              ranchList.push(tempThis[`ranches`].find(e => e.id === c.ranchName));
            }
            // Get all commodity names
            c.commodityArray.forEach( v => {
              if (!commodityList.find(e => e.id === v.commodity)) {
                commodityList.push(tempThis[`commodities`].find(e => e.id === v.commodity));
              }
            });
          });
          // Reassign common values to values found in at least one card
          this[`ranches`] = tempThis.common.sortCommonArray(ranchList, 'ranches');
          // format commodities array for multi-select option, varieties aren't needed
          this[`commodities`] = tempThis.common.sortCommonArray(commodityList, 'commodities').map(e => {
            return {id: e.id, value: e.value.key};
          });
          this.loading = false;
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
          this.nav.goBack();
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        this.nav.goBack();
      });
  }
}

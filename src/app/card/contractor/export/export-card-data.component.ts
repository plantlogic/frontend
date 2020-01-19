import {CommonFormDataService} from '../../../_api/common-form-data.service';
import {Component, OnInit} from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardViewService} from '../../../_api/card-view.service';
import {NavService} from '../../../_interact/nav.service';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardContractorComponent implements OnInit {

  constructor(private titleService: TitleService, private cardExport: CardExportService, public cardService: CardViewService,
              private nav: NavService) {}

  loading = true;
  generating = false;

  fromDate: number = Date.now();
  toDate: number = Date.now();
  includeUnharvested = false;

  ranchList: Array<string> = [];
  selectedRanches: Array<string> = [];
  commodityList: Array<string> = [];
  selectedCommodities: Array<string> = [];

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  multiselectSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  ngOnInit() {
    this.titleService.setTitle('Export Data');

    this.cardService.getAllCards().subscribe(
      data => {
        if (data.success) {
          data.data.map(c => (new Card()).copyConstructor(c)).forEach(c => {
            // Get all ranch names
            if (!this.ranchList.includes(c.ranchName)) {
              this.ranchList.push(c.ranchName);
            }

            // Get all commodities
            c.commodityArray.filter(v => v.commodity).forEach(v => {
              if (!this.commodityList.includes(v.commodity)) {
                this.commodityList.push(v.commodity);
              }
            });
          });

          this.ranchList.sort();
          this.commodityList.sort();

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

  generate(): void {
    this.generating = true;
    this.fromDate = (new Date(this.fromDate)).valueOf();
    this.toDate = (new Date(this.toDate)).valueOf();

    this.cardExport.generateExport(this.fromDate, this.toDate, this.ranchList, this.commodityList, this.includeUnharvested);
    this.generating = false;
  }
}

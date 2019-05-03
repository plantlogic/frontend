import { CommonFormDataService } from './../../../_api/common-form-data.service';
import { Component, OnInit } from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TitleService } from '../../../_interact/title.service';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder, private cardExport: CardExportService,
              public commonData: CommonFormDataService) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  flatpickrOptions2: FlatpickrOptions = { dateFormat: 'm-d-Y'};
  myFormRanch: FormGroup;
  myFormCommodity: FormGroup;
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  commodities: Array<any> = [];
  selectedItemsRanch: Array<any> = [];
  selectedItemsCommodity: Array<any> = [];
  dropdownSettings: any = {};

  ngOnInit() {
    this.titleService.setTitle('Export Data');
    this.commodities = [
      {item_id: 1, item_text: 'Lettuce'},
      {item_id: 2, item_text: 'Strawberry'},
      {item_id: 3, item_text: 'Broccoli'},
      {item_id: 4, item_text: 'Tomato'}
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: this.ShowFilter
    };
    this.myFormRanch = this.fb.group({
      ranch: [this.selectedItemsRanch],
    });
    this.myFormCommodity = this.fb.group({
      commodity: [this.selectedItemsCommodity]
    });
  }
  onItemSelect(item: any) {
    console.log('onItemSelect', item);
  }
  onSelectAll(items: any) {
    console.log('onSelectAll', items);
  }
  toogleShowFilter() {
    this.ShowFilter = !this.ShowFilter;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings, { allowSearchFilter: this.ShowFilter });
  }
  generateExampleCard(): void {
    this.cardExport.exampleGenerate();
  }
}

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

  constructor(private titleService: TitleService, private fb: FormBuilder, private cardExport: CardExportService) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  flatpickrOptions2: FlatpickrOptions = { dateFormat: 'm-d-Y'};
  myForm: FormGroup;        disabled = false;
  ShowFilter = false;
  limitSelection = false;
  ranches: Array = [];
  selectedItems: Array = [];
  dropdownSettings: any = {};
  commodities: Array = [];

  ngOnInit() {
    this.titleService.setTitle('Export Data');
    this.ranches = [
      { item_id: 1, item_text: 'Del Monte' },
      { item_id: 2, item_text: 'Baillie' },
      { item_id: 3, item_text: 'Broome' },
      { item_id: 4, item_text: 'Buena Vista' },
      { item_id: 5, item_text: 'Home Canyon' },
      { item_id: 6, item_text: 'Toro' }
    ];

    this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: this.ShowFilter
    };
    this.myForm = this.fb.group({
        ranch: [this.selectedItems]
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

  handleLimitSelection() {
      if (this.limitSelection) {
          this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: 2 });
      } else {
          this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: null });
      }
  }


}

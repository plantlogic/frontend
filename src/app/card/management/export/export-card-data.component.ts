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
  form: FormGroup;
  ranchList: Array<any> = ['Mesa Ranch', 'Wolf Ranch', 'El Paso Ranch', 'Coyote Ranch'];
  commodityList: Array<any> = [
  { commodity: 'Lettuce', variety: ['Select', 'Lettuce v1', 'Lettuce v2'] },
  { commodity: 'Strawberry', variety: ['Select', 'Strawberry v1', 'Strawberry v2'] },
  { commodity: 'Broccoli', variety: ['Select', 'Broccoli v1', ' Broccoli v2', 'Broccoli v3'] },
  { commodity: 'Tomato', variety: ['Select', 'Tomato v1', 'Tomato v2', 'Tomato v3'] },
  ];
  ngOnInit() {
    this.titleService.setTitle('Export Data');
  }

  generateExampleCard(): void {
    this.cardExport.exampleGenerate();
  }

}

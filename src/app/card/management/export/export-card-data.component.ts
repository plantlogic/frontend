import { Component, OnInit } from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';
import {FlatpickrOptions} from 'ng2-flatpickr';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardDataComponent implements OnInit {

  constructor(private cardExport: CardExportService) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};

  ngOnInit() {
  }

  generateExampleCard(): void {
    this.cardExport.exampleGenerate();
  }

}

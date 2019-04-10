import { Component, OnInit } from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardDataComponent implements OnInit {

  constructor(private cardExport: CardExportService) { }

  ngOnInit() {
  }

  generateExampleCard(): void {
    this.cardExport.exampleGenerate();
  }

}

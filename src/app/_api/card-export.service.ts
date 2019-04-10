import { Injectable } from '@angular/core';
import FileDownload from 'js-file-download';
import { environment } from '../../environments/environment';
import { AlertService } from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardExportService {
  // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
  private table: Array<Array<string>> = [];
  // The name of the file. The .csv extension will automatically be appended.
  private fileName = environment.AppName + '-export';


  constructor(private http: HttpClient) { }
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  public exampleGenerate(): void {
    // ^ We could specify method input such as date range and then pass that as parameters to the server

    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      data => {
        // If data is successful retrieved
        if (data.success) {
          // Add column labels
          this.table.push(['Lot Number', 'Ranch Manager', 'Commodities']);

          // Take our data and put it in the table.
          data.data.forEach(x => {
              this.table.push(
                [x.lotNumber, x.ranchManagerName, x.commodity.join(' - ')]
              );
            }
          );

          this.fileName = 'example-generated-card';

          // Initiate generation and download
          this.generateAndDownload();

        } else {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  // Helper - generates the CSV and invokes the file download
  private generateAndDownload(): void {
    FileDownload(
      // Generate the CSV from the table
      this.table.map(x => x.join(',')).join('\n'),
      // Filename
      this.fileName + '.csv'
    );
  }
}

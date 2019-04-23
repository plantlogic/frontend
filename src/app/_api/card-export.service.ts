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
  constructor(private http: HttpClient) { }
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  public exampleGenerate(): void {
    // ^ We could specify method input such as date range and then pass that as parameters to the server

    /* this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      data => {
        // If data is successful retrieved
        if (data.success) {
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Total Acres',
                      'Bed Type', 'Lorsban Rate', 'Diaznon Rate', 'Kerb Rate', 'Dacthal Rate',
                      'Wet Date', 'Thin Date', 'Hoe Date', 'Harvest Date',
                      '']);

          // Take our data and put it in the table.
          data.data.forEach(x => {
            // Push simple data
              table.push(
                [String(x.fieldID), x.ranchName, x.ranchManagerName, x.lotNumber,
                 String(x.totalAcres), String(x.bedType), String(x.lorsbanRate), String(x.diaznonRate),
                 String(x.kerbRate), String(x.dacthalRate), String(x.wetDate), String(x.thinDate),
                 String(x.hoeDate), String(x.harvestDate)]
              );

              // Pushing headers for irrigation data
              table.push(['', 'Irrigation Data']);
              table.push(['', 'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', '',
                      'Date', 'Method', 'Fertilizer', 'Gallons', ''
              ]);

              // Retrieve data from nested irrigation data objects and insert into table
              x.irrigationArray.forEach(y => {
                table.push(['', String(y.workDate), y.method, y.fertilizer, String(y.gallons)]);
              });

              // Blank line for seperation of irrigation and tractor data
              table.push([]);

              // Push headers for tractor data
              table.push(['', 'Tractor Data']);
              table.push(['', 'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
                          'Date', 'Done', 'Operator', 'Fertilizer', 'Gallons', '',
              ]);

              // Retrieve data from nested tractor data objects and insert into table
              x.tractorArray.forEach(z => {
                table.push(['', String(z.workDate), z.workDone, z.operator, z.fertilizer, String(z.gallons)]);
              });

              // Blank spaces to signal new planter card
              table.push([]); table.push([]);
            }
          );

          // Initiate generation and download
          this.generateAndDownload(table, 'example-generated-card');

        } else {
          // Show server error
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        // Show connection error
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    ); */
  }

  // Helper - generates the CSV and invokes the file download
  private generateAndDownload(table: Array<Array<string>>, fileName: string): void {
    FileDownload(
      // Generate the CSV from the table
      table.map(x => x.map(y => this.replaceBadCharacters(y)).join(',')).join('\n'),
      // Filename
      fileName + '.csv'
    );
  }

  // Takes care of commas and quotations that may occur in any cells, following RFC 4180
  private replaceBadCharacters(x: string): string {
    if (x && x.includes(',')) {
      // Escapes quotation marks
      x = x.replace(/"/g, '""');
      // Adds quotes around cell that contains at least one comma
      x = '"' + x + '"';
    }
    return x;
  }
}

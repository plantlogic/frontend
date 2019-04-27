import { Injectable } from '@angular/core';
import FileDownload from 'js-file-download';
import { environment } from '../../environments/environment';
import { AlertService } from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { post } from 'selenium-webdriver/http';

@Injectable({
  providedIn: 'root'
})
export class CardExportService {
  constructor(private http: HttpClient) { }
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  public exampleGenerate(): void {
    // ^ We could specify method input such as date range and then pass that as parameters to the server

    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      data => {
        // If data is successful retrieved
        if (data.success) {
          console.log("Successful Subscription");
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Shipper ID',
                      'Wet Date', 'Thin Date', 'Hoe Date', 'Harvest Date','',
                      //Irrigation Data, 12 total
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      //Tractor Data, 12 total
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      //Commodity Data, 3 Total
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety','',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety','',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety','',
                      //Preplant, 3 total
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',
                      //Postplant, 3 total
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit'
          ]);
          var dataLine: Array<string> = [];
          // Take our data and put it in the table.
          data.data.forEach(x => {
              // Push simple data
              console.log(x);
              dataLine.push(
                String(x.fieldID), x.ranchName, x.ranchManagerName, x.lotNumber, x.shipperID,
                String(x.wetDate), String(x.thinDate), String(x.hoeDate), String(x.harvestDate)
              );
              console.log(x.commodities);
              console.log(x.tractorArray);
              console.log(x.commodityArray);
              console.log(x.preChemicalArray);
              console.log(x.postChemicalArray);
              /*
              // Retrieve data from nested irrigation data objects and insert into table
              if(x.irrigationArray === null){
                console.log("it empty");
              }
              else{ x.irrigationArray.forEach(y => {
                dataLine.push('', String(y.workDate), y.method, 
                              y.chemical.name, String(y.chemical.rate), String(y.chemical.unit), 
                              y.fertilizer.name, String(y.fertilizer.rate), String(y.fertilizer.unit));
              });
              }
              // Retrieve data from nested tractor data objects and insert into table
              if(x.tractorArray === null){
                console.log("its empty");
              }
              else{x.tractorArray.forEach(z => {
                dataLine.push('', String(z.workDate), z.workDone, z.operator,
                              z.chemical.name, String(z.chemical.rate), String(z.chemical.unit),
                              z.fertilizer.name, String(z.fertilizer.rate), String(z.fertilizer.unit));
              });
              }
              if(x.commodityArray === null){
                console.log("ok");
              }
              else{x.commodityArray.forEach(c => {
                dataLine.push('', c.commodity, String(c.cropAcres), String(c.bedType),
                              String(c.bedCount), String(c.seedLotNumber), c.variety);
              });
              }
              if(x.preChemicalArray === null){
                console.log("fucked");
              }
              else{x.preChemicalArray.forEach(preC => {
                dataLine.push('', String(preC.date), preC.chemical.name, String(preC.chemical.rate), String(preC.chemical.unit),
                               preC.fertilizer.name, String(preC.fertilizer.rate), String(preC.fertilizer.unit));
              });}
              if(x.postChemicalArray === null){
                console.log("ok");
              }
              else{x.postChemicalArray.forEach(postC => {
                dataLine.push('', String(postC.date), postC.chemical.name, String(postC.chemical.rate), String(postC.chemical.unit),
                              postC.fertilizer.name, String(postC.fertilizer.rate), String(postC.fertilizer.unit));
              });}
              table.push(dataLine);
              dataLine = [];
              */
          });

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
    ); 
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

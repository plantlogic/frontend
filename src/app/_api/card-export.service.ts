import { Injectable } from '@angular/core';
import FileDownload from 'js-file-download';
import { environment } from '../../environments/environment';
import { AlertService } from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { post } from 'selenium-webdriver/http';
import { callbackify } from 'util';
import { ElementFinder } from 'protractor';

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
          console.log('Successful Subscription');
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['', '', '', '', '',
                      '', '', '', '', '',
                      '1st', 'Irrigation','','','','','','','', '2nd','Irrigation','','','','','','','','3rd','Irrigation','','','','','','','',
                      '4th', 'Irrigation','','','','','','','', '5th','Irrigation','','','','','','','','6th','Irrigation','','','','','','','',
                      '7th', 'Irrigation','','','','','','','', '8th','Irrigation','','','','','','','','9th','Irrigation','','','','','','','',
                      '10th', 'Irrigation','','','','','','','', '11th','Irrigation','','','','','','','','12th','Irrigation','','','','','','','',
                      '1st', 'Tractor','','','','','','','', '', '2nd','Tractor','','','','','','','','', '3rd','Tractor','','','','','','','','',
                      '4th', 'Tractor','','','','','','','', '', '5th','Tractor','','','','','','','','', '6th','Tractor','','','','','','','','',
                      '7th', 'Tractor','','','','','','','','', '8th','Tractor','','','','','','','','', '9th','Tractor','','','','','','','','',
                      '10th', 'Tractor','','','','','','','','', '11th','Tractor','','','','','','','','', '12th','Tractor','','','','','','','','',
                      '1st', 'Commodity','','','','','', '2nd','Commodity','','','','','', '3rd','Commodity','','','','','',
                      '1st','Pre Plant','','','','','','','2nd','Pre Plant','','','','','','','3rd','Pre Plant','','','','','','',
                      '1st','At Plant','','','','','','','2nd','At Plant','','','','','','','3rd','At Plant','','','','','','',
          ]);
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Shipper ID',
                      'Wet Date', 'Thin Date', 'Hoe Date', 'Harvest Date', '',
                      // Irrigation Data, 12 total
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Tractor Data, 12 total
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Commodity Data, 3 Total
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      // Preplant, 3 total
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      // Postplant, 3 total
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit','',
                      'Date', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit',''
          ]);
          let dataLine: Array<string> = [];
          let pushCounter = 0;
          // Take our data and put it in the table.
          data.data.forEach(x => {
              x = (new Card()).copyConstructor(x);
              // Push simple data
              dataLine.push(
                String(x.fieldID), x.ranchName, x.ranchManagerName, x.lotNumber, x.shipperID,
                String(x.wetDate), String(x.thinDate), String(x.hoeDate), String(x.harvestDate)
              );
              
              // Retrieve data from nested irrigation data objects and insert into table
              if(!x.irrigationArray.length){
                dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');
                dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');
                dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');
                dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');dataLine.push('','','','','','','','','');
              }
              else{
                x.irrigationArray.forEach(y => {
                  if(!y.chemical){
                    if(!y.fertilizer){
                      dataLine.push('', String(y.workDate), y.method, "", "", "", "", "", "");
                    }
                    else{
                      dataLine.push('', String(y.workDate), y.method, "","","", y.fertilizer.name, String(y.fertilizer.rate), String(y.fertilizer.unit));
                    }
                  }
                  else if(!y.fertilizer){
                    if(!y.chemical){
                      dataLine.push('', String(y.workDate), y.method, "", "", "", "", "", "");
                    }
                    else{
                      dataLine.push('', String(y.workDate), y.method, y.chemical.name, String(y.chemical.rate), String(y.chemical.unit), "", "", "");
                    }
                  }

                  else{
                     dataLine.push('', String(y.workDate), y.method, y.chemical.name, String(y.chemical.rate), String(y.chemical.unit),
                                   y.fertilizer.name, String(y.fertilizer.rate), String(y.fertilizer.unit));
                  }
                  pushCounter+=1;
                });
                if(pushCounter<12){
                  while(pushCounter<12){
                    dataLine.push('','','','','','','','','');
                    pushCounter+=1;
                  }
                }
                pushCounter=0;
              } 
              // Retrieve data from nested tractor data objects and insert into table
              console.log(x.tractorArray);
              if(!x.tractorArray.length){
                dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');
                dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');
                dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');
                dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');dataLine.push('','','','','','','','','','');
              }
              else{
                x.tractorArray.forEach(z => {
                  if(!z.chemical){
                    if(!z.fertilizer){
                      dataLine.push('', String(z.workDate), z.workDone, z.operator, "", "", "", "", "", "");
                    }
                    else{
                      dataLine.push('', String(z.workDate), z.workDone, z.operator, "","","", z.fertilizer.name, String(z.fertilizer.rate), String(z.fertilizer.unit));
                    }
                  }
                  else if(!z.fertilizer){
                    if(!z.chemical){
                      dataLine.push('', String(z.workDate), z.workDone, z.operator, "", "", "", "", "", "");
                    }
                    else{
                      dataLine.push('', String(z.workDate), z.workDone, z.operator, z.chemical.name, String(z.chemical.rate), String(z.chemical.unit), "", "", "");
                    }
                  }

                  else{
                     dataLine.push('', String(z.workDate), z.workDone, z.operator, z.chemical.name, String(z.chemical.rate), String(z.chemical.unit),
                                   z.fertilizer.name, String(z.fertilizer.rate), String(z.fertilizer.unit));
                  }
                  pushCounter+=1;
                });
                if(pushCounter<12){
                  while(pushCounter<12){
                    dataLine.push('','','','','','','','','','');
                    pushCounter+=1;
                  }
                }
                pushCounter=0;
              }
    
              if(!x.commodityArray.length){
                dataLine.push('','','','','','','');dataLine.push('','','','','','','');dataLine.push('','','','','','','');
              }
              else{
                x.commodityArray.forEach(c => {
                  dataLine.push('', c.commodity, String(c.cropAcres), String(c.bedType),
                                String(c.bedCount), String(c.seedLotNumber), c.variety);
                  pushCounter+=1;
                });
                if(pushCounter<3){
                  while(pushCounter<3){
                    dataLine.push('','','','','','','');
                    pushCounter+=1;
                  }
                }
                pushCounter=0;
              }
              
              if(!x.preChemicalArray.length){
                dataLine.push('', '', '', '', '', '', '', '');dataLine.push('', '', '', '', '', '', '', '');dataLine.push('', '', '', '', '', '', '', '');
              }
              else{
                x.preChemicalArray.forEach(preC => {
                  if(!preC.chemical){
                    if(!preC.fertilizer){
                      dataLine.push('', String(preC.date), '', '', '', '', '', '');
                    }
                    else{
                      dataLine.push('', String(preC.date), '','','', preC.fertilizer.name, String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                    }
                  }
                  else if(!preC.fertilizer){
                    if(!preC.chemical){
                      dataLine.push('', String(preC.date), '', '', '', '', '', '');
                    }
                    else{
                      dataLine.push('', String(preC.date), preC.chemical.name, String(preC.chemical.rate), String(preC.chemical.unit), '', '', '');
                    }
                  }

                  else{
                     dataLine.push('', String(preC.date), preC.chemical.name, String(preC.chemical.rate), String(preC.chemical.unit),
                                   preC.fertilizer.name, String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                  }
                  pushCounter+=1;
                });
                if(pushCounter<3){
                  while(pushCounter<3){
                    dataLine.push('', '', '', '', '', '', '', '');
                    pushCounter+=1;
                  }
                }
                pushCounter=0;
              }

              if(!x.postChemicalArray.length){
                dataLine.push('', '', '', '', '', '', '', '');dataLine.push('', '', '', '', '', '', '', '');dataLine.push('', '', '', '', '', '', '', '');
              }
              else{
                x.postChemicalArray.forEach(postC => {
                  if(!postC.chemical){
                    if(!postC.fertilizer){
                      dataLine.push('', String(postC.date), '', '', '', '', '', '');
                    }
                    else{
                      dataLine.push('', String(postC.date), '','','', postC.fertilizer.name, String(postC.fertilizer.rate), String(postC.fertilizer.unit));
                    }
                  }
                  else if(!postC.fertilizer){
                    if(!postC.chemical){
                      dataLine.push('', String(postC.date), '', '', '', '', '', '');
                    }
                    else{
                      dataLine.push('', String(postC.date), postC.chemical.name, String(postC.chemical.rate), String(postC.chemical.unit), '', '', '');
                    }
                  }
                  else{
                     dataLine.push('', String(postC.date), postC.chemical.name, String(postC.chemical.rate), String(postC.chemical.unit),
                                   postC.fertilizer.name, String(postC.fertilizer.rate), String(postC.fertilizer.unit));
                  }
                  pushCounter+=1;
                });
                if(pushCounter<3){
                  while(pushCounter<3){
                    dataLine.push('', '', '', '', '', '', '', '');
                    pushCounter+=1;
                  }
                }
                pushCounter=0;
              }

              table.push(dataLine);
              dataLine = [];
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

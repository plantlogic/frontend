import {Injectable} from '@angular/core';
import FileDownload from 'js-file-download';
import {environment} from '../../environments/environment';
import {AlertService} from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardExportService {
  constructor(private http: HttpClient) { }
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  public generateExport(from: number, to: number, ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      data => {
        console.log(data);
        // If data is successful retrieved
        if (data.success) {
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['', '', '', '', '', '', '', '', '', '', '', '',
                      '1st', 'Irrigation', '', '', '', '', '', '', '', '',
                      '2nd', 'Irrigation', '', '', '', '', '', '', '', '',
                      '3rd', 'Irrigation', '', '', '', '', '', '', '', '',
                      '4th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '5th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '6th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '7th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '8th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '9th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '10th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '11th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '12th', 'Irrigation', '', '', '', '', '', '', '', '',
                      '1st', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '2nd', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '3rd', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '4th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '5th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '6th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '7th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '8th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '9th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '10th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '11th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '12th', 'Tractor', '', '', '', '', '', '', '', '', '',
                      '1st', 'Commodity', '', '', '', '', '',
                      '2nd', 'Commodity', '', '', '', '', '',
                      '3rd', 'Commodity', '', '', '', '', '',
                      '1st', 'Pre Plant', '', '', '', '', '', '', '',
                      '2nd', 'Pre Plant', '', '', '', '', '', '', '',
                      '3rd', 'Pre Plant', '', '', '', '', '', '', '',
                      '1st', 'At Plant', '', '', '', '', '', '', '',
                      '2nd', 'At Plant', '', '', '', '', '', '', '',
                      '3rd', 'At Plant', '', '', '', '', '', '', '',
                      '4th', 'At Plant', '', '', '', '', '', '', '',
                      '5th', 'At Plant', '', '', '', '', '', '', '',
                      '6th', 'At Plant', '', '', '', '', '', '', '',
                      '7th', 'At Plant', '', '', '', '', '', '', '',
                      '8th', 'At Plant', '', '', '', '', '', '', '',
                      '9th', 'At Plant', '', '', '', '', '', '', '',
                      '10th', 'At Plant', '', '', '', '', '', '', '',
                      '11th', 'At Plant', '', '', '', '', '', '', '',
                      '12th', 'At Plant', '', '', '', '', '', '',
          ]);
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Shipper ID',
                      'Wet Date', 'Thin Date', 'Thin Type', 'Hoe Date', 'Hoe Type', 'Harvest Date', '',
                      // Irrigation Data, 12 total
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Tractor Data, 12 total
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Commodity Data, 3 Total
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      // Preplant, 3 total
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Postplant, 12 total
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      'Date', 'Time', 'Chemical', 'Rate', 'Unit', 'Fertilizer', 'Rate', 'Unit', '',
                      // Comments, 1 total
                      'Comments'
          ]);
          let dataLine: Array<string> = [];
          let pushCounter = 0;
          // Take our data
          data.data
            // Convert into real card
            .map(x => (new Card()).copyConstructor(x))
            // Filter it to match user filters
            .filter(x => {
              // If card doesn't contain any of our selected ranches
              if (!x.ranchName || !ranches.includes(x.ranchName)) {
                return false;
              }

              // If card doesn't contain any of our selected commodities
              if (!x.commodityArray.map(c => commodities.includes(c.commodity)).some(c => c)) {
                return false;
              }

              // If we're including open cards
              if (includeUnharvested && (!x.harvestDate || !x.closed)) {
                return true;
              }

              // If the harvest date is outside the requested date range
              if (!x.harvestDate || from > (new Date(x.harvestDate)).valueOf() || to < (new Date(x.harvestDate)).valueOf()) {
                return false;
              }

              return true;
            })
            // Put in the table
            .forEach(x => {
              // Push simple data
              dataLine.push(
                String(x.fieldID), x.ranchName, x.ranchManagerName, x.lotNumber, x.shipperID,
                String(x.wetDate), String(x.thinDate), String(x.thinType), String(x.hoeDate), String(x.hoeType), String(x.harvestDate)
              );

              // Retrieve data from nested irrigation data objects and insert into table
              if (!x.irrigationArray.length) {

                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '');

              } else {
                x.irrigationArray.forEach(y => {
                  if (!y.chemical) {
                    if (!y.fertilizer) {
                      dataLine.push('', String(y.workDate), y.irrigator, y.method, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', String(y.workDate), y.irrigator, y.method, '', '', '',
                                    y.fertilizer.name, String(y.fertilizer.rate), String(y.fertilizer.unit));
                    }
                  } else if (!y.fertilizer) {
                    if (!y.chemical) {
                      dataLine.push('', String(y.workDate), y.irrigator, y.method, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', String(y.workDate), y.irrigator, y.method,
                                    y.chemical.name, String(y.chemical.rate), String(y.chemical.unit), '', '', '');
                    }
                  } else {
                     dataLine.push('', String(y.workDate), y.irrigator, y.method, y.chemical.name,
                                   String(y.chemical.rate), String(y.chemical.unit),
                                   y.fertilizer.name, String(y.fertilizer.rate), String(y.fertilizer.unit));
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 12) {
                  while (pushCounter < 12) {
                    dataLine.push('', '', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }
              // Retrieve data from nested tractor data objects and insert into table

              if (!x.tractorArray.length) {
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '', '', '');
              } else {
                x.tractorArray.forEach(z => {
                  if (!z.chemical) {
                    if (!z.fertilizer) {
                      dataLine.push('', z.tractorNumber, String(z.workDate), z.workDone, z.operator, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', z.tractorNumber, String(z.workDate), z.workDone, z.operator, '', '', '',
                                    z.fertilizer.name, String(z.fertilizer.rate), String(z.fertilizer.unit));
                    }
                  } else if (!z.fertilizer) {
                    if (!z.chemical) {
                      dataLine.push('', z.tractorNumber, String(z.workDate), z.workDone, z.operator, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', z.tractorNumber, String(z.workDate), z.workDone, z.operator, z.chemical.name,
                                    String(z.chemical.rate), String(z.chemical.unit), '', '', '');
                    }
                  } else {
                     dataLine.push('', z.tractorNumber, String(z.workDate), z.workDone, z.operator, z.chemical.name,
                                   String(z.chemical.rate), String(z.chemical.unit),
                                   z.fertilizer.name, String(z.fertilizer.rate), String(z.fertilizer.unit));
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 12) {
                  while (pushCounter < 12) {
                    dataLine.push('', '', '', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }
              if (!x.commodityArray.length) {
                dataLine.push('', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '');
              } else {
                x.commodityArray.forEach(c => {
                  dataLine.push('', c.commodity, String(c.cropAcres), c.bedType,
                                String(c.bedCount), c.seedLotNumber, c.variety);
                  pushCounter += 1;
                });
                if (pushCounter < 3) {
                  while (pushCounter < 3) {
                    dataLine.push('', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }
              if (!x.preChemicalArray.length) {
                dataLine.push('', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '', '');
              } else {
                x.preChemicalArray.forEach(preC => {
                  const dt = this.separateDateTime(preC.date);
                  if (!preC.chemical) {
                    if (!preC.fertilizer) {
                      dataLine.push('', dt.date, dt.time, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', dt.date, dt.time, '', '', '', preC.fertilizer.name,
                                    String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                    }
                  } else if (!preC.fertilizer) {
                    if (!preC.chemical) {
                      dataLine.push('', dt.date, dt.time, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', dt.date, dt.time, preC.chemical.name, String(preC.chemical.rate),
                                    String(preC.chemical.unit), '', '', '');
                    }
                  } else {
                     dataLine.push('', dt.date, dt.time, preC.chemical.name,
                                   String(preC.chemical.rate), String(preC.chemical.unit),
                                   preC.fertilizer.name, String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 3) {
                  while (pushCounter < 3) {
                    dataLine.push('', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }

              if (!x.postChemicalArray.length) {
                for (let i = 0; i < 12; i++) {
                  dataLine.push('', '', '', '', '', '', '', '', '');
                }
              } else {
                x.postChemicalArray.forEach(postC => {
                  const dt = this.separateDateTime(postC.date);
                  if (!postC.chemical) {
                    if (!postC.fertilizer) {
                      dataLine.push('', dt.date, dt.time, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', dt.date, dt.time, '', '', '', postC.fertilizer.name,
                                    String(postC.fertilizer.rate), String(postC.fertilizer.unit));
                    }
                  } else if (!postC.fertilizer) {
                    if (!postC.chemical) {
                      dataLine.push('', dt.date, dt.time, '', '', '', '', '', '');
                    } else {
                      dataLine.push('', dt.date, dt.time, postC.chemical.name,
                                    String(postC.chemical.rate), String(postC.chemical.unit), '', '', '');
                    }
                  } else {
                     dataLine.push('', dt.date, dt.time, postC.chemical.name,
                                   String(postC.chemical.rate), String(postC.chemical.unit),
                                   postC.fertilizer.name, String(postC.fertilizer.rate), String(postC.fertilizer.unit));
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 12) {
                  while (pushCounter < 12) {
                    dataLine.push('', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }

              if (!x.comment) {
                dataLine.push('', '');
              } else {
                dataLine.push('', x.comment);
              }

              table.push(dataLine);
              dataLine = [];
          });

          // Initiate generation and download
          this.generateAndDownload(table, environment.AppName + '-export');

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

  private separateDateTime(dt: number) {
    const dateTime = new Date(String(dt));
    return {
      date: dateTime.toDateString(),
      time: dateTime.toTimeString()
    };
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

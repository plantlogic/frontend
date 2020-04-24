import {Injectable} from '@angular/core';
import FileDownload from 'js-file-download';
import {environment} from '../../environments/environment';
import {AlertService} from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {Card} from '../_dto/card/card';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CommonLookup } from './common-data.service';
import { CommonFormDataService } from './common-form-data.service';
import { AuthService } from '../_auth/auth.service';
import { Comment } from '../_dto/card/comment';
import { Chemical } from '../_dto/card/chemical';
import { TractorEntry } from '../_dto/card/tractor-entry';
import { setTimeout } from 'timers';
import { IrrigationEntry } from '../_dto/card/irrigation-entry';

@Injectable({
  providedIn: 'root'
})
export class CardExportService {
  constructor(private http: HttpClient, public common: CommonFormDataService, private auth: AuthService) { }
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  private cardIDsToValues(card: Card, commonData): Card {
    card.ranchName = this.findCommonValue(commonData, 'ranches', ['value'], card.ranchName);
    if (card.shippers) {
      const shippers = [];
      try {
        card.shippers.forEach(e => {
          shippers.push(this.findCommonValue(commonData, 'shippers', ['value'], e));
        });
        card.shippers = shippers;
      } catch (e) {
        console.log(e);
      }
      card.initShippersString();
    }
    card.commodityArray.forEach(e => {
      e.commodity = this.findCommonValue(commonData, 'commodities', ['value', 'key'], e.commodity);
      e.bedType = this.findCommonValue(commonData, 'bedTypes', ['value'], e.bedType);
    });
    card.preChemicalArray.forEach(e => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue(commonData, 'chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue(commonData, 'fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    // card.postChemicalArray.forEach(e => {
    //   if (e.chemical) {
    //     e.chemical.name = this.findCommonValue(commonData, 'chemicals', ['value'], e.chemical.name);
    //     e.chemical.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.chemical.unit);
    //   }
    //   if (e.fertilizer) {
    //     e.fertilizer.name = this.findCommonValue(commonData, 'fertilizers', ['value'], e.fertilizer.name);
    //     e.fertilizer.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.fertilizer.unit);
    //   }
    // });
    card.tractorArray.forEach(e => {
      e.workDone = this.findCommonValue(commonData, 'tractorWork', ['value'], e.workDone);
      e.operator = this.findCommonValue(commonData, 'tractorOperators', ['value'], e.operator);
      for (const c of e.chemicalArray) {
        c.name = this.findCommonValue(commonData, 'chemicals', ['value'], c.name);
        c.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], c.unit);
      }
      for (const f of e.fertilizerArray) {
        f.name = this.findCommonValue(commonData, 'fertilizers', ['value'], f.name);
        f.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], f.unit);
      }
    });
    card.irrigationArray.forEach(e => {
      e.method = this.findCommonValue(commonData, 'irrigationMethod', ['value'], e.method);
      e.irrigator = this.findCommonValue(commonData, 'irrigators', ['value'], e.irrigator);
      for (const c of e.chemicalArray) {
        c.name = this.findCommonValue(commonData, 'chemicals', ['value'], c.name);
        c.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], c.unit);
      }
      for (const f of e.fertilizerArray) {
        f.name = this.findCommonValue(commonData, 'fertilizers', ['value'], f.name);
        f.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], f.unit);
      }
    });
    if (!card.hoeDate) {
      card.hoeType = null;
    }
    if (!card.thinDate) {
      card.thinType = null;
    }
    return card;
  }

  public commentsToDisplayString(comments: Array<Comment>): string {
    let displayString = '';
    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      let cString = '';
      try {
        cString = `[${this.dateToDisplay(c.dateModified, true)}] ${c.author}: ${c.body}`;
      } catch (e) {
        cString = '[Error Processing Comment]';
      }
      if (i < comments.length - 1) {
        displayString += cString + ' | ';
      } else {
        displayString += cString;
      }
    }
    return displayString;
  }

  public dateToDisplay(dateInput, time?: boolean): string {
    // Modify how the date appears in the export
    // Convert to Date object for nicer print
    if (!dateInput) { return ''; }
    try {
      const d = new Date(dateInput);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      // dirty fix to remove invalid dates (remove after validating all cards)
      if (year === 1969) { return ''; }
      let dateStr = month + '/' + day + '/' + year;
      if (time) { dateStr += ' - ' + d.toTimeString(); }
      return dateStr;
    } catch (e) {
      return '[Could Not Convert]: ' + dateInput;
    }
  }

  public export(from: number, to: number, ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.initCommon(commonData => {
      this.generateExport(commonData, from, to, ranches, commodities, includeUnharvested);
    });
  }

  /*
    Searches common values in [key] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
 findCommonValue(commonData, key, valuePropertyArr, targetID) {
  if (!targetID) { return ''; }
  let commonValue;
  try {
    commonValue = commonData[key].find(e => {
      return e.id === targetID;
    });
    valuePropertyArr.forEach(p => {
      commonValue = commonValue[p];
    });
  } catch (e) {
    console.log(e);
  }
  return (commonValue) ? commonValue : '';
}

  public generateExport(commonData, from: number, to: number, ranches: Array<string>, commodities: Array<string>,
                        includeUnharvested: boolean): void {
    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      data => {
        // If data is successful retrieved
        if (data.success) {
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['', '', '', '', '', '', '', '', '', '', '', '',
                      '1st', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '2nd', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '3rd', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '4th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '5th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '6th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '7th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '8th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '9th', 'Irrigation', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '10th', 'Irrigation', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '',
                      '11th', 'Irrigation', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '',
                      '12th', 'Irrigation', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '',
                      '1st', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '2nd', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '3rd', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '4th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '5th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '6th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '7th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '8th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '9th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '10th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '11th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '12th', 'Tractor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                      '1st', 'Commodity', '', '', '', '', '',
                      '2nd', 'Commodity', '', '', '', '', '',
                      '3rd', 'Commodity', '', '', '', '', '',
                      '1st', 'Pre Plant', '', '', '', '', '', '',
                      '2nd', 'Pre Plant', '', '', '', '', '', '',
                      '3rd', 'Pre Plant', '', '', '', '', '', '',
                      // '1st', 'At Plant', '', '', '', '', '', '',
                      // '2nd', 'At Plant', '', '', '', '', '', '',
                      // '3rd', 'At Plant', '', '', '', '', '', '',
                      // '4th', 'At Plant', '', '', '', '', '', '',
                      // '5th', 'At Plant', '', '', '', '', '', '',
                      // '6th', 'At Plant', '', '', '', '', '', '',
                      // '7th', 'At Plant', '', '', '', '', '', '',
                      // '8th', 'At Plant', '', '', '', '', '', '',
                      // '9th', 'At Plant', '', '', '', '', '', '',
                      // '10th', 'At Plant', '', '', '', '', '', '',
                      // '11th', 'At Plant', '', '', '', '', '', '',
                      // '12th', 'At Plant', '', '', '', '', '', '',
          ]);
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Shippers',
                      'Wet Date', 'Thin Date', 'Thin Type', 'Hoe Date', 'Hoe Type', 'Harvest Date', '',
                      // Irrigation Data, 12 total
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Date', 'Irrigator', 'Method', 'Duration (Hours)', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',

                      // Tractor Data, 12 total
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      'Tractor Number', 'Date', 'Work Done', 'Operator', 'Chemical 1', 'Rate /ac', 'Unit', 'Chemical 2', 'Rate /ac', 'Unit',
                                                                 'Fertilizer 1', 'Rate /ac', 'Unit', 'Fertilizer 2', 'Rate /ac', 'Unit', '',
                      // Drip Tape Check
                      'Driptape', '',
                      // Commodity Data, 3 Total
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      'Commodity', 'Crop Acres', 'Bed Type', 'Bed Count', 'SeedLotNumber', 'Variety', '',
                      // Preplant, 3 total
                      'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // Postplant, 12 total
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // 'Date', 'Chemical', 'Rate /ac', 'Unit', 'Fertilizer', 'Rate /ac', 'Unit', '',
                      // Comments, 1 total
                      'Comments'
          ]);
          let dataLine: Array<string> = [];
          let pushCounter = 0;
          let hasDripTape = false;
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
              // Convert card common ids to their values
              x = this.cardIDsToValues(x, commonData);
              // Push simple data
              dataLine.push(
                (x.fieldID) ? String(x.fieldID) : '',
                (x.ranchName) ? x.ranchName : '',
                (x.ranchManagerName) ? x.ranchManagerName : '',
                (x.lotNumber) ? x.lotNumber : '',
                (x.shippersString) ? x.shippersString : '',
                this.dateToDisplay(x.wetDate),
                this.dateToDisplay(x.thinDate),
                (x.thinType) ? String(x.thinType) : '',
                this.dateToDisplay(x.hoeDate),
                (x.hoeType) ? String(x.hoeType) : '',
                this.dateToDisplay(x.harvestDate)
              );

              // Retrieve data from nested irrigation data objects and insert into table
              if (!x.irrigationArray.length) {
                for (let i = 0; i < 12; i ++) {
                  dataLine.push('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
                }
              } else {
                x.irrigationArray.forEach(y => {
                  y = Object.assign(new IrrigationEntry(), y);
                  hasDripTape = hasDripTape || this.hasDripTape(y);
                  dataLine.push('', this.dateToDisplay(y.workDate), y.irrigator, y.method, String(y.duration));
                  if (y.chemicalArray.length) {
                    y.chemicalArray.forEach(e => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = y.chemicalArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  if (y.fertilizerArray.length) {
                    y.fertilizerArray.forEach(e => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = y.fertilizerArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 12) {
                  while (pushCounter < 12) {
                    dataLine.push('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }
              // Retrieve data from nested tractor data objects and insert into table

              if (!x.tractorArray.length) {
                for (let i = 0; i < 12; i ++) {
                  dataLine.push('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
                }
              } else {
                x.tractorArray.forEach(z => {
                  z = Object.assign(new TractorEntry(), z);
                  hasDripTape = hasDripTape || this.hasDripTape(z);
                  dataLine.push('', z.tractorNumber, this.dateToDisplay(z.workDate), z.workDone, z.operator);
                  if (z.chemicalArray.length) {
                    z.chemicalArray.forEach(e => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = z.chemicalArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  if (z.fertilizerArray.length) {
                    z.fertilizerArray.forEach(e => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = z.fertilizerArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 12) {
                  while (pushCounter < 12) {
                    dataLine.push('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }

              // DRIP TAPE
              if (hasDripTape) {
                dataLine.push('', 'Yes');
              } else {
                dataLine.push('', 'No');
              }
              // RESET DRIP TAPE BOOLEAN
              hasDripTape = false;

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
                dataLine.push('', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '', '');
              } else {
                x.preChemicalArray.forEach(preC => {
                  const dt = this.dateToDisplay(preC.date);
                  if (!preC.chemical) {
                    if (!preC.fertilizer) {
                      // no chem, no fert
                      dataLine.push('', dt, '', '', '', '', '', '');
                    } else {
                      // no chem, has fert
                      dataLine.push('', dt, '', '', '', preC.fertilizer.name,
                                    String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                    }
                  } else if (!preC.fertilizer) {
                    // has chem, no fert
                    dataLine.push('', dt, preC.chemical.name, String(preC.chemical.rate), String(preC.chemical.unit), '', '', '');
                  } else {
                    // has chem, has fert
                     dataLine.push('', dt, preC.chemical.name,
                                   String(preC.chemical.rate), String(preC.chemical.unit),
                                   preC.fertilizer.name, String(preC.fertilizer.rate), String(preC.fertilizer.unit));
                  }
                  pushCounter += 1;
                });
                if (pushCounter < 3) {
                  while (pushCounter < 3) {
                    dataLine.push('', '', '', '', '', '', '', '');
                    pushCounter += 1;
                  }
                }
                pushCounter = 0;
              }

              // if (!x.postChemicalArray.length) {
              //   for (let i = 0; i < 12; i++) {
              //     dataLine.push('', '', '', '', '', '', '', '');
              //   }
              // } else {
              //   x.postChemicalArray.forEach(postC => {
              //     const dt = this.dateToDisplay(postC.date);
              //     if (!postC.chemical) {
              //       if (!postC.fertilizer) {
              //         // no chem, no fert
              //         dataLine.push('', dt, '', '', '', '', '', '');
              //       } else {
              //         // no chem, has fert
              //         dataLine.push('', dt, '', '', '', postC.fertilizer.name,
              //                       String(postC.fertilizer.rate), String(postC.fertilizer.unit));
              //       }
              //     } else if (!postC.fertilizer) {
              //       // has chem, no fert
              //       dataLine.push('', dt, postC.chemical.name, String(postC.chemical.rate), String(postC.chemical.unit), '', '', '');
              //     } else {
              //       // has chem, has fert
              //        dataLine.push('', dt, postC.chemical.name,
              //                      String(postC.chemical.rate), String(postC.chemical.unit),
              //                      postC.fertilizer.name, String(postC.fertilizer.rate), String(postC.fertilizer.unit));
              //     }
              //     pushCounter += 1;
              //   });
              //   if (pushCounter < 12) {
              //     while (pushCounter < 12) {
              //       dataLine.push('', '', '', '', '', '', '', '');
              //       pushCounter += 1;
              //     }
              //   }
              //   pushCounter = 0;
              // }

              if (!x.comments) {
                dataLine.push('', '');
              } else {
                dataLine.push('', this.commentsToDisplayString(x.comments));
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

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues(data => {
      Object.keys(CommonLookup).forEach(key => {
        if (CommonLookup[key].type === 'hashTable') {
          const temp = [];
          data[key].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[key] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
        }
      });
      f(sortedCommon);
    });
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

  hasDripTape(e): boolean {
    if (e.method) {
      // Irrigation Entry
      return String(e.method).toLowerCase().includes('drip');
    } else if (e.workDone) {
      // Tractor Entry
      return String(e.workDone).toLowerCase().includes('drip');
    } else {
      return false;
    }
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

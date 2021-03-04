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
import { ExportPreset } from '../_dto/card/export-preset';
import { Commodities } from '../_dto/card/commodities';
import { Chemicals } from '../_dto/card/chemicals';
import { ThinHoeCrew } from '../_dto/card/thinHoeCrew';

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
        card.shippers.forEach((e) => {
          shippers.push(this.findCommonValue(commonData, 'shippers', ['value'], e));
        });
        card.shippers = shippers;
      } catch (e) {
        // console.log(e);
      }
      card.initShippersString();
    }
    card.commodityArray.forEach((e) => {
      e.commodity = this.findCommonValue(commonData, 'commodities', ['value', 'key'], e.commodity);
      e.bedType = this.findCommonValue(commonData, 'bedTypes', ['value'], e.bedType);
    });
    card.preChemicalArray.forEach((e) => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue(commonData, 'chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue(commonData, 'fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue(commonData, 'chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.tractorArray.forEach((e) => {
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
    card.irrigationArray.forEach((e) => {
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
    // if (!card.hoeDate) {
    //   card.hoeType = null;
    // }
    // if (!card.thinDate) {
    //   card.thinType = null;
    // }
    card.thinDate = null;
    card.thinType = null;
    card.hoeDate = null;
    card.hoeType = null;

    card.initThinHoeCostPerAcre(commonData.thinHoeCrew);
    card.thinCrewsArray.forEach((e) => {
      e.crew = this.findCommonValue(commonData, 'thinHoeCrew', ['value', 'key'], e.crew);
    });
    card.hoeCrewsArray.forEach((e) => {
      e.crew = this.findCommonValue(commonData, 'thinHoeCrew', ['value', 'key'], e.crew);
    });

    return card;
  }

  public commentsToDisplayString(comments: Array<Comment>): string {
    let displayString = '';
    for (let i = 0; i < comments.length; i++) {
      const c = comments[`${i}`];
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

  public compareDates(a, b): number {
    let comparison = 0;
    const valA = a.date;
    const valB = b.date;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
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

  public export(from: number, to: number, fromCropYear: number, toCropYear: number,
                ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.initCommon(commonData => {
      this.generateExport(commonData, from, to, fromCropYear, toCropYear, ranches, commodities, includeUnharvested);
    });
  }

  public exportAllApplied(from: number, to: number, fromCropYear: number, toCropYear: number,
                          ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.initCommon(commonData => {
      this.generateAppliedExport(commonData, from, to, fromCropYear, toCropYear, ranches, commodities, includeUnharvested);
    });
  }

  public exportAllFertilizerApplied(from: number, to: number, fromCropYear: number, toCropYear: number, ranches: Array<string>,
                                    commodities: Array<string>, includeUnharvested: boolean): void {
    this.initCommon(commonData => {
      this.generateAppliedFertilizerExport(commonData, from, to, fromCropYear, toCropYear, ranches, commodities, includeUnharvested);
    });
  }

  public exportCustom(from: number, to: number, fromCropYear: number, toCropYear: number, ranches: Array<string>,
                      commodities: Array<string>, includeUnharvested: boolean, exportPreset: ExportPreset): void {
    this.initCommon(commonData => {
      this.generateCustomExport(commonData, from, to, fromCropYear, toCropYear,
                                ranches, commodities, includeUnharvested, exportPreset);
    });
  }

  /*
    Searches common values in [`${key}`] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  public findCommonValue(commonData, key, valuePropertyArr, targetID) {
    if (!targetID) { return ''; }
    let commonValue;
    try {
      commonValue = commonData[`${key}`].find((e) => {
        return e.id === targetID;
      });
      valuePropertyArr.forEach((p) => {
        commonValue = commonValue[`${p}`];
      });
    } catch (e) {
    //  console.log(e);
    }
    return (commonValue) ? commonValue : '';
  }

  findMinNumForCols(cards: Array<Card>) {
    let numFerts = 0;
    let numChems = 0;
    let numCommodities = 0;
    cards.forEach((card) => {
      let tempNumFert = 0;
      let tempNumChem = 0;
      let tempNumCommodities = 0;
      card.preChemicalArray.forEach((e) => {
        if (e.fertilizer) { tempNumFert++; }
        if (e.chemical) { tempNumChem++; }
      });
      card.tractorArray.forEach((e) => {
        tempNumFert += e.fertilizerArray.length;
        tempNumChem += e.chemicalArray.length;
      });
      card.irrigationArray.forEach((e) => {
        tempNumFert += e.fertilizerArray.length;
        tempNumChem += e.chemicalArray.length;
      });
      tempNumCommodities = card.commodityArray.length;
      if (tempNumFert > numFerts) { numFerts = tempNumFert; }
      if (tempNumChem > numChems) { numChems = tempNumChem; }
      if (tempNumCommodities > numCommodities) { numCommodities = tempNumCommodities; }
    });
    return {
      numFertilizers: numFerts,
      numChemicals: numChems,
      numCommodities
    };
  }

  public generateAppliedExport(commonData, from: number, to: number, fromCropYear: number, toCropYear: number,
                               ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      (data) => {
        // If data is successful retrieved
        if (data.success) {
          const cards = data.data.map((x) => (new Card()).copyConstructor(x)).filter((x) => {
            // If card doesn't contain any of our selected ranches
            if (!x.ranchName || !ranches.includes(x.ranchName)) { return false; }
            // If card doesn't contain any of our selected commodities
            if (!x.commodityArray.map((c) => commodities.includes(c.commodity)).some((c) => c)) { return false; }
            if (!x.cropYear || x.cropYear < fromCropYear  || x.cropYear > toCropYear) { return false; }
            // If the harvest date is outside the requested date range
            if (!includeUnharvested) {
              if (!x.harvestDate || !x.closed || from > (new Date(x.harvestDate)).valueOf() || to < (new Date(x.harvestDate)).valueOf()) {
                return false;
              }
            }
            return true;
          });

          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          let dataLine = [];

          // Add blank header for general ranch info (3)
          dataLine.push('', '', '');

          // Add minimum number of commodity columns needed
          const size = this.findMinNumForCols(cards);

          const numCommodityColumns = size[`numCommodities`];
          for (let i = 0; i < numCommodityColumns; i++) { dataLine.push(''); }

          // For each chem/fert there will be 6 columns: date, name, method, material, rate/acre, unit
          const numFertilizerColumns = size[`numFertilizers`] * 6;
          const numChemicalColumns = size[`numChemicals`] * 6;

          // Add headers for Fertilizer and Chemical sections
          dataLine.push('Fertilizers');
          for (let i = 0; i < (numFertilizerColumns - 1); i++) { dataLine.push(''); }
          dataLine.push('Chemicals');
          for (let i = 0; i < (numChemicalColumns - 1); i++) { dataLine.push(''); }

          // Add top headers and start new line
          table.push(dataLine);

          // Clear line and add secondary headers
          // General info headers
          dataLine = ['Field ID', 'Lot #', 'Ranch Name'];
          // Commodity headers
          for (let i = 1; i <= numCommodityColumns; i++) { dataLine.push(`Commodity ${i}`); }
          // Fertilizer headers
          for (let i = 0; i < size[`numFertilizers`]; i++) {
            dataLine.push('Date', 'Name', 'Method', 'Material', 'Rate/ Acre', 'Unit');
          }
          // Chemical headers
          for (let i = 0; i < size[`numChemicals`]; i++) {
            dataLine.push('Date', 'Name', 'Method', 'Material', 'Rate/ Acre', 'Unit');
          }
          table.push(dataLine);

          // Add card information
          cards.forEach((card) => {
            // Wipe line and convert card ids to display values
            dataLine = [];
            card = this.cardIDsToValues(card, commonData);
            const applied = this.getAppliedFertilizersAndChemicals(card);
            // Push general ranch info
            dataLine.push(
              (card.fieldID) ? String(card.fieldID) : '',
              (card.lotNumber) ? card.lotNumber : '',
              (card.ranchName) ? card.ranchName : ''
            );

            // Push dynamically set commodity info
            for (let i = 0; i < numCommodityColumns; i++) {
              if (i >= card.commodityArray.length) {
                dataLine.push('');
              } else {
                dataLine.push(card.commodityArray[`${i}`].commodity);
              }
            }

            // Push dynamically set fertilizer info
            for (let i = 0; i < size[`numFertilizers`]; i++) {
              if (i >= applied[`fertilizers`].length) {
                dataLine.push('', '', '', '', '', '');
              } else {
                const temp = applied[`fertilizers`][`${i}`];
                dataLine.push(temp[`date`], temp[`name`], temp[`method`], temp[`material`], temp[`rate`], temp[`unit`]);
              }
            }

            // Push dynamically set chemical info
            for (let i = 0; i < size[`numChemicals`]; i++) {
              if (i >= applied[`chemicals`].length) {
                dataLine.push('', '', '', '', '', '');
              } else {
                const temp = applied[`chemicals`][`${i}`];
                dataLine.push(temp[`date`], temp[`name`], temp[`method`], temp[`material`], temp[`rate`], temp[`unit`]);
              }
            }

            // Push card info and start new line
            table.push(dataLine);
          });

          // Initiate generation and download
          this.generateAndDownload(table, environment.AppName + '-applied-export');

        } else {
          // Show server error
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        // Show connection error
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  public generateAppliedFertilizerExport(commonData, from: number, to: number, fromCropYear: number, toCropYear: number,
                                         ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      (data) => {
        // If data is successful retrieved
        if (data.success) {
          const cards = data.data.map((x) => (new Card()).copyConstructor(x)).filter((x) => {
            // If card doesn't contain any of our selected ranches
            if (!x.ranchName || !ranches.includes(x.ranchName)) { return false; }
            // If card doesn't contain any of our selected commodities
            if (!x.commodityArray.map((c) => commodities.includes(c.commodity)).some((c) => c)) { return false; }
            if (!x.cropYear || x.cropYear < fromCropYear  || x.cropYear > toCropYear) { return false; }
            // If the harvest date is outside the requested date range
            if (!includeUnharvested) {
              if (!x.harvestDate || !x.closed || from > (new Date(x.harvestDate)).valueOf() || to < (new Date(x.harvestDate)).valueOf()) {
                return false;
              }
            }
            return true;
          });

          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          let dataLine = [];

          // Add blank header for general ranch info (3)
          dataLine.push('', '', '');

          // Add minimum number of commodity columns needed
          const size = this.findMinNumForCols(cards);

          const numCommodityColumns = size[`numCommodities`];
          for (let i = 0; i < numCommodityColumns; i++) { dataLine.push(''); }

          // For each chem/fert there will be 6 columns: date, name, method, material, rate/acre, unit
          const numFertilizerColumns = size[`numFertilizers`] * 4;

          // Add headers for Fertilizer and Chemical sections
          dataLine.push('Fertilizers');
          for (let i = 0; i < (numFertilizerColumns - 1); i++) { dataLine.push(''); }

          // Add top headers and start new line
          table.push(dataLine);

          // Clear line and add secondary headers
          // General info headers
          dataLine = ['Field ID', 'Lot #', 'Ranch Name'];
          // Commodity headers
          for (let i = 1; i <= numCommodityColumns; i++) { dataLine.push(`Commodity ${i}`); }
          // Fertilizer headers
          for (let i = 0; i < size[`numFertilizers`]; i++) {
            dataLine.push('Date', 'Material', 'Rate/ Acre', 'Unit');
          }
          table.push(dataLine);

          // Add card information
          cards.forEach((card) => {
            // Wipe line and convert card ids to display values
            dataLine = [];
            card = this.cardIDsToValues(card, commonData);
            const applied = this.getAppliedFertilizersAndChemicals(card);
            // Push general ranch info
            dataLine.push(
              (card.fieldID) ? String(card.fieldID) : '',
              (card.lotNumber) ? card.lotNumber : '',
              (card.ranchName) ? card.ranchName : ''
            );

            // Push dynamically set commodity info
            for (let i = 0; i < numCommodityColumns; i++) {
              if (i >= card.commodityArray.length) {
                dataLine.push('');
              } else {
                dataLine.push(card.commodityArray[`${i}`].commodity);
              }
            }

            // Push dynamically set fertilizer info
            for (let i = 0; i < size[`numFertilizers`]; i++) {
            if (i >= applied[`fertilizers`].length) {
                dataLine.push('', '', '', '');
              } else {
                const temp = applied[`fertilizers`][`${i}`];
                dataLine.push(temp[`date`], temp[`material`], temp[`rate`], temp[`unit`]);
              }
            }

            // Push card info and start new line
            table.push(dataLine);
          });

          // Initiate generation and download
          this.generateAndDownload(table, environment.AppName + '-applied-fertilizer-export');

        } else {
        // Show server error
        AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        // Show connection error
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  public generateCustomExport(commonData, from: number, to: number, fromCropYear: number, toCropYear: number,
                              ranches: Array<string>, commodities: Array<string>,
                              includeUnharvested: boolean, preset: ExportPreset) {
      preset = Object.assign(new ExportPreset(), preset);
      // Set old (legacy) preset values to false
      preset.card.forEach((e) => {
        switch (e.key) {
          case 'thinDate':
          case 'thinType':
          case 'hoeDate':
          case 'hoeType':
            e.value = false;
            break;
          default:
            break;
        }
      });
      this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
        (data) => {
          // If data is successful retrieved
          if (data.success) {

            // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
            const table: Array<Array<string>> = [];

            const dataLine: Array<string> = [];

            // Set defaults for the number of all entries (dynamic or static)
            const numEntries = {
              card: {
                irrigation: (preset.dynamic.card.irrigation) ? 0 : 12,
                tractor: (preset.dynamic.card.tractor) ? 0 : 12,
                commodities: (preset.dynamic.card.commodities) ? 0 : 3,
                preChemicals: (preset.dynamic.card.preChemicals) ? 0 : 3,
                thinCrews: (preset.dynamic.card.thinCrews) ? 0 : 1,
                hoeCrews: (preset.dynamic.card.hoeCrews) ? 0 : 3
              },
              irrigationEntry: {
                fertilizers: (preset.dynamic.irrigationEntry.fertilizers) ? 0 : 2,
                chemicals: (preset.dynamic.irrigationEntry.chemicals) ? 0 : 2
              },
              tractorEntry: {
                fertilizers: (preset.dynamic.tractorEntry.fertilizers) ? 0 : 2,
                chemicals: (preset.dynamic.tractorEntry.chemicals) ? 0 : 2
              }
            };

            const cards: Card[] = data.data.map((x) => (new Card()).copyConstructor(x)).filter((x) => {
              if (!x.ranchName || !ranches.includes(x.ranchName)) { return false; }
              if (!x.commodityArray.map((c) => commodities.includes(c.commodity)).some((c) => c)) { return false; }
              // If the harvest date is outside the requested date range
              if (!includeUnharvested) {
                if (!x.harvestDate || !x.closed || from > (new Date(x.harvestDate)).valueOf() || to < (new Date(x.harvestDate)).valueOf()) {
                  return false;
                }
              }
              if (!x.cropYear || x.cropYear < fromCropYear  || x.cropYear > toCropYear) { return false; }
              return true;
            });

            cards.forEach((card) => {
              if (preset.dynamic.card.irrigation) {
                numEntries.card.irrigation = Math.max(numEntries.card.irrigation, card.irrigationArray.length);
              }
              if (preset.dynamic.card.tractor) {
                numEntries.card.tractor = Math.max(numEntries.card.tractor, card.tractorArray.length);
              }
              if (preset.dynamic.card.commodities) {
                numEntries.card.commodities = Math.max(numEntries.card.commodities, card.commodityArray.length);
              }
              if (preset.dynamic.card.preChemicals) {
                numEntries.card.preChemicals = Math.max(numEntries.card.preChemicals, card.preChemicalArray.length);
              }
              if (preset.dynamic.card.thinCrews) {
                numEntries.card.thinCrews = Math.max(numEntries.card.thinCrews, card.thinCrewsArray.length);
              }
              if (preset.dynamic.card.hoeCrews) {
                numEntries.card.hoeCrews = Math.max(numEntries.card.hoeCrews, card.hoeCrewsArray.length);
              }
              if (preset.dynamic.irrigationEntry.fertilizers) {
                numEntries.irrigationEntry.fertilizers = Math.max(
                    numEntries.irrigationEntry.fertilizers,
                    Math.max.apply(Math, card.irrigationArray.map((i) => i.fertilizerArray.length))
                    // card.irrigationArray.map((i) => i.fertilizerArray.length).sort((a, b) => b - a)[0]
                  );
              }
              if (preset.dynamic.irrigationEntry.chemicals) {
                numEntries.irrigationEntry.chemicals = Math.max(
                  numEntries.irrigationEntry.chemicals,
                  Math.max.apply(Math, card.irrigationArray.map((i) => i.chemicalArray.length))
                  // card.irrigationArray.map((i) => i.chemicalArray.length).sort((a, b) => b - a)[0]
                );
              }
              if (preset.dynamic.tractorEntry.fertilizers) {
                numEntries.tractorEntry.fertilizers = Math.max(
                  numEntries.tractorEntry.fertilizers,
                  Math.max.apply(Math, card.tractorArray.map((i) => i.fertilizerArray.length))
                  // card.tractorArray.map((i) => i.fertilizerArray.length).sort((a, b) => b - a)[0]
                );
              }
              if (preset.dynamic.tractorEntry.chemicals) {
                numEntries.tractorEntry.chemicals = Math.max(
                  numEntries.tractorEntry.chemicals,
                  Math.max.apply(Math, card.tractorArray.map((i) => i.chemicalArray.length))
                  // card.tractorArray.map((i) => i.chemicalArray.length).sort((a, b) => b - a)[0]
                );
              }
            });

            table.push(this.getTopHeader(preset, numEntries));
            table.push(this.getSubHeader(preset, numEntries));

            cards.forEach((card) => {
              table.push(this.getBodyRow(preset, numEntries, this.cardIDsToValues(card, commonData)));
            });

            // Initiate generation and download
            const filename = preset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            this.generateAndDownload(table, `${environment.AppName}-${filename}`);
          } else {
            // Show server error
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        (failure) => {
          // Show connection error
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        }
      );
  }

  public generateExport(commonData, from: number, to: number, fromCropYear: number, toCropYear: number,
                        ranches: Array<string>, commodities: Array<string>, includeUnharvested: boolean): void {
    this.http.get<BasicDTO<Card[]>>(environment.ApiUrl + '/data/view/ranches', this.httpOptions).subscribe(
      (data) => {
        // If data is successful retrieved
        if (data.success) {
          // Format is [x][y]: [x] is a row and [y] is a column. Commas and newlines will automatically be added.
          const table: Array<Array<string>> = [];
          // Add column labels
          table.push(['', '', '', '', '', '', '', '',
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
          ]);
          table.push(['Field ID', 'Ranch Name', 'Ranch Manager', 'Lot Number', 'Shippers',
                      'Wet Date', 'Harvest Date', '',
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
                      // Comments, 1 total
                      'Comments'
          ]);
          let dataLine: Array<string> = [];
          let pushCounter = 0;
          // Take our data
          data.data
            // Convert into real card
            .map((x) => (new Card()).copyConstructor(x))
            // Filter it to match user filters
            .filter((x) => {
              // If card doesn't contain any of our selected ranches
              if (!x.ranchName || !ranches.includes(x.ranchName)) {
                return false;
              }

              // If card doesn't contain any of our selected commodities
              if (!x.commodityArray.map((c) => commodities.includes(c.commodity)).some((c) => c)) {
                return false;
              }

              // If the crop year is outside the requested range
              if (!x.cropYear || x.cropYear < fromCropYear  || x.cropYear > toCropYear) {
                return false;
              }

              // If the harvest date is outside the requested date range
              if (!includeUnharvested) {
                if (!x.harvestDate || !x.closed || from > (new Date(x.harvestDate)).valueOf() || to < (new Date(x.harvestDate)).valueOf()) {
                  return false;
                }
              }

              return true;
            })
            // Put in the table
            .forEach((x) => {
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
                this.dateToDisplay(x.harvestDate)
              );

              // Retrieve data from nested irrigation data objects and insert into table
              if (!x.irrigationArray.length) {
                for (let i = 0; i < 12; i ++) {
                  dataLine.push('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
                }
              } else {
                x.irrigationArray.forEach((y) => {
                  y = Object.assign(new IrrigationEntry(), y);
                  dataLine.push('', this.dateToDisplay(y.workDate), y.irrigator, y.method, String(y.duration));
                  if (y.chemicalArray.length) {
                    y.chemicalArray.forEach((e) => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = y.chemicalArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  if (y.fertilizerArray.length) {
                    y.fertilizerArray.forEach((e) => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
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
                x.tractorArray.forEach((z) => {
                  z = Object.assign(new TractorEntry(), z);
                  dataLine.push('', z.tractorNumber, this.dateToDisplay(z.workDate), z.workDone, z.operator);
                  if (z.chemicalArray.length) {
                    z.chemicalArray.forEach((e) => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
                    for (let i = z.chemicalArray.length; i < 2; i++) { dataLine.push('', '', ''); }
                  } else {
                    for (let i = 0; i < 2; i++) { dataLine.push('', '', ''); }
                  }
                  if (z.fertilizerArray.length) {
                    z.fertilizerArray.forEach((e) => { dataLine.push(e.name, String(e.rate), String(e.unit)); });
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
              dataLine.push('', this.getDripTape(x));

              if (!x.commodityArray.length) {
                dataLine.push('', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '');
                dataLine.push('', '', '', '', '', '', '');
              } else {
                x.commodityArray.forEach((c) => {
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
                x.preChemicalArray.forEach((preC) => {
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
      (failure) => {
        // Show connection error
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  // Helper - generates the CSV and invokes the file download
  private generateAndDownload(table: Array<Array<string>>, fileName: string): void {
    FileDownload(
      // Generate the CSV from the table
      table.map((x) => x.map((y) => this.replaceBadCharacters(y)).join(',')).join('\n'),
      // Filename
      fileName + '.csv'
    );
  }

  private getAppliedFertilizersAndChemicals(card: Card) {
    // 'Date', 'Name', 'Method', 'Material', 'Rate/ Acre', 'Unit'
    let fertilizers = [];
    let chemicals = [];

    card.preChemicalArray.forEach((e) => {
      if (e.fertilizer) {
        fertilizers.push({
          date: e.date,
          name: 'Pre-plant',
          method: 'Pre-plant',
          material: e.fertilizer.name,
          rate: String(e.fertilizer.rate),
          unit: e.fertilizer.unit
        });
      }
      if (e.chemical) {
        chemicals.push({
          date: e.date,
          name: 'Pre-plant',
          method: 'Pre-plant',
          material: e.chemical.name,
          rate: String(e.chemical.rate),
          unit: e.chemical.unit
        });
      }
    });

    card.tractorArray.forEach( (e) => {
      e.fertilizerArray.forEach((x) => {
        fertilizers.push({
          date: e.workDate,
          name: e.operator,
          method: 'Tractor',
          material: x.name,
          rate: String(x.rate),
          unit: x.unit
        });
      });
      e.chemicalArray.forEach((x) => {
        chemicals.push({
          date: e.workDate,
          name: e.operator,
          method: 'Tractor',
          material: x.name,
          rate: String(x.rate),
          unit: x.unit
        });
      });
    });

    card.irrigationArray.forEach( (e) => {
      e.fertilizerArray.forEach((x) => {
        fertilizers.push({
          date: e.workDate,
          name: e.irrigator,
          method: 'Irrigation',
          material: x.name,
          rate: String(x.rate),
          unit: x.unit
        });
      });
      e.chemicalArray.forEach((x) => {
        chemicals.push({
          date: e.workDate,
          name: e.irrigator,
          method: 'Irrigation',
          material: x.name,
          rate: String(x.rate),
          unit: x.unit
        });
      });
    });

    fertilizers = fertilizers.sort(this.compareDates).map((e) => {
      e.date = this.dateToDisplay(e.date);
      return e;
    });
    chemicals = chemicals.sort(this.compareDates).map((e) => {
      e.date = this.dateToDisplay(e.date);
      return e;
    });

    return { fertilizers, chemicals };
  }

  getDripTape(card: Card): string {
    let driptape = false;
    let burriedDriptape = false;
    card.tractorArray.forEach((e) => {
      const work = String(e.workDone).toLowerCase();
      if (work.includes('buried drip')) {
        burriedDriptape = true;
      } else if (work.includes('drip')) {
        driptape = true;
      }
    });
    card.irrigationArray.forEach((e) => {
      const method = String(e.method).toLowerCase();
      if (method.includes('buried drip')) {
        burriedDriptape = true;
      } else if (method.includes('drip')) {
        driptape = true;
      }
    });
    if (driptape || burriedDriptape) {
      if (driptape && burriedDriptape) {
        return 'driptape, buried driptape';
      } else {
        return (driptape) ? 'driptape' : 'buried driptape';
      }
    } else {
      return 'no';
    }
  }

  getBodyRow(preset: ExportPreset, numEntries, card: Card): Array<string> {
    const tempThis = this;
    const dataLine: Array<string> = [];
    let lastEntryWasSingleValue = false;
    // Add Top Headers
    preset.card.forEach((e) => {
      if (e.value === true) {
        if (e.key === 'commodities') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.commodities; i++) {
            preset.commodities.forEach((e2) => {
              if (e2.value === true ) {
                if (card.commodityArray[`${i}`]) {
                  const temp: Commodities = card.commodityArray[`${i}`];
                  switch (e2.key) {
                    case 'commodity':
                      dataLine.push( (temp.commodity) ? temp.commodity : '');
                      break;
                    case 'variety':
                      dataLine.push( (temp.variety) ? temp.variety : '');
                      break;
                    case 'seedLotNumber':
                      dataLine.push( (temp.seedLotNumber) ? String(temp.seedLotNumber) : '');
                      break;
                    case 'cropAcres':
                      dataLine.push( (temp.cropAcres) ? String(temp.cropAcres) : '');
                      break;
                    case 'bedCount':
                      dataLine.push( (temp.bedCount) ? String(temp.bedCount) : '');
                      break;
                    case 'bedType':
                      dataLine.push( (temp.bedType) ? temp.bedType : '');
                      break;
                    default:
                      dataLine.push('Unknown Key: ' + e2.key);
                      break;
                  }
                } else {
                  dataLine.push('');
                }
              }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'irrigation') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.irrigation; i++) {
            preset.irrigationEntry.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizers') {
                  for (let j = 0; j < numEntries.irrigationEntry.fertilizers; j++) {
                    preset.irrigationEntryFertilizers.forEach((e3) => {
                      if (e3.value === true) {
                        if (card.irrigationArray[`${i}`] && card.irrigationArray[`${i}`].fertilizerArray[`${j}`]) {
                          const temp: Chemical = card.irrigationArray[`${i}`].fertilizerArray[`${j}`];
                          switch (e3.key) {
                            case 'name':
                              dataLine.push( (temp.name) ? temp.name : '');
                              break;
                            case 'rate':
                              dataLine.push( (temp.rate) ? String(temp.rate) : '');
                              break;
                            case 'unit':
                              dataLine.push( (temp.unit) ? temp.unit : '');
                              break;
                            default:
                              dataLine.push('Unknown Key: ' + e3.key);
                              break;
                          }
                        } else {
                          dataLine.push('');
                        }
                      }
                    });
                  }
                } else if (e2.key === 'chemicals') {
                  for (let j = 0; j < numEntries.irrigationEntry.chemicals; j++) {
                    preset.irrigationEntryChemicals.forEach((e3) => {
                      if (e3.value === true) {
                        if (card.irrigationArray[`${i}`] && card.irrigationArray[`${i}`].chemicalArray[`${j}`]) {
                          const temp: Chemical = card.irrigationArray[`${i}`].chemicalArray[`${j}`];
                          switch (e3.key) {
                            case 'name':
                              dataLine.push( (temp.name) ? temp.name : '');
                              break;
                            case 'rate':
                              dataLine.push( (temp.rate) ? String(temp.rate) : '');
                              break;
                            case 'unit':
                              dataLine.push( (temp.unit) ? temp.unit : '');
                              break;
                            default:
                              dataLine.push('Unknown Key: ' + e3.key);
                              break;
                          }
                        } else {
                          dataLine.push('');
                        }
                      }
                    });
                  }
                } else {
                  if (card.irrigationArray[`${i}`]) {
                    const temp: IrrigationEntry = card.irrigationArray[`${i}`];
                    switch (e2.key) {
                      case 'workDate':
                        dataLine.push((temp.workDate) ? tempThis.dateToDisplay(temp.workDate) : '');
                        break;
                      case 'method':
                        dataLine.push( (temp.method) ? temp.method : '');
                        break;
                      case 'irrigator':
                        dataLine.push( (temp.irrigator) ? temp.irrigator : '');
                        break;
                      case 'duration':
                        dataLine.push( (temp.duration) ? String(temp.duration) : '');
                        break;
                      default:
                        dataLine.push('Unknown Key: ' + e2.key);
                        break;
                    }
                  } else {
                    dataLine.push('');
                  }
                }
              }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'tractor') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.tractor; i++) {
            preset.tractorEntry.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizers') {
                  for (let j = 0; j < numEntries.tractorEntry.fertilizers; j++) {
                    preset.tractorEntryFertilizers.forEach((e3) => {
                      if (e3.value === true) {
                        if (card.tractorArray[`${i}`] && card.tractorArray[`${i}`].fertilizerArray[`${j}`]) {
                          const temp: Chemical = card.tractorArray[`${i}`].fertilizerArray[`${j}`];
                          switch (e3.key) {
                            case 'name':
                              dataLine.push( (temp.name) ? temp.name : '');
                              break;
                            case 'rate':
                              dataLine.push( (temp.rate) ? String(temp.rate) : '');
                              break;
                            case 'unit':
                              dataLine.push( (temp.unit) ? temp.unit : '');
                              break;
                            default:
                              dataLine.push('Unknown Key: ' + e3.key);
                              break;
                          }
                        } else {
                          dataLine.push('');
                        }
                      }
                    });
                  }
                } else if (e2.key === 'chemicals') {
                  for (let j = 0; j < numEntries.tractorEntry.chemicals; j++) {
                    preset.tractorEntryChemicals.forEach((e3) => {
                      if (e3.value === true) {
                        if (card.tractorArray[`${i}`] && card.tractorArray[`${i}`].chemicalArray[`${j}`]) {
                          const temp: Chemical = card.tractorArray[`${i}`].chemicalArray[`${j}`];
                          switch (e3.key) {
                            case 'name':
                              dataLine.push( (temp.name) ? temp.name : '');
                              break;
                            case 'rate':
                              dataLine.push( (temp.rate) ? String(temp.rate) : '');
                              break;
                            case 'unit':
                              dataLine.push( (temp.unit) ? temp.unit : '');
                              break;
                            default:
                              dataLine.push('Unknown Key: ' + e3.key);
                              break;
                          }
                        } else {
                          dataLine.push('');
                        }
                      }
                    });
                  }
                } else {
                  if (card.tractorArray[`${i}`]) {
                    const temp: TractorEntry = card.tractorArray[`${i}`];
                    switch (e2.key) {
                      case 'workDate':
                        dataLine.push((temp.workDate) ? tempThis.dateToDisplay(temp.workDate) : '');
                        break;
                      case 'workDone':
                        dataLine.push( (temp.workDone) ? temp.workDone : '');
                        break;
                      case 'operator':
                        dataLine.push( (temp.operator) ? temp.operator : '');
                        break;
                      case 'tractorNumber':
                        dataLine.push( (temp.tractorNumber) ? String(temp.tractorNumber) : '');
                        break;
                      default:
                        dataLine.push('Unknown Key: ' + e2.key);
                        break;
                    }
                  } else {
                    dataLine.push('');
                  }
                }
               }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'preChemicals') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.preChemicals; i++) {
            preset.preChemicals.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizer') {
                  preset.preChemicalsFertilizer.forEach((e3) => {
                    if (e3.value === true) {
                      if (card.preChemicalArray[`${i}`] && card.preChemicalArray[`${i}`].fertilizer) {
                        const temp: Chemical = card.preChemicalArray[`${i}`].fertilizer;
                        switch (e3.key) {
                          case 'name':
                            dataLine.push( (temp.name) ? temp.name : '');
                            break;
                          case 'rate':
                            dataLine.push( (temp.rate) ? String(temp.rate) : '');
                            break;
                          case 'unit':
                            dataLine.push( (temp.unit) ? temp.unit : '');
                            break;
                          default:
                            dataLine.push('Unknown Key: ' + e3.key);
                            break;
                        }
                      } else {
                        dataLine.push('');
                      }
                    }
                  });
                } else if (e2.key === 'chemical') {
                  preset.preChemicalsChemical.forEach((e3) => {
                    if (e3.value === true) {
                      if (card.preChemicalArray[`${i}`] && card.preChemicalArray[`${i}`].chemical) {
                        const temp: Chemical = card.preChemicalArray[`${i}`].chemical;
                        switch (e3.key) {
                          case 'name':
                            dataLine.push( (temp.name) ? temp.name : '');
                            break;
                          case 'rate':
                            dataLine.push( (temp.rate) ? String(temp.rate) : '');
                            break;
                          case 'unit':
                            dataLine.push( (temp.unit) ? temp.unit : '');
                            break;
                          default:
                            dataLine.push('Unknown Key: ' + e3.key);
                            break;
                        }
                      } else {
                        dataLine.push('');
                      }
                    }
                  });
                } else {
                  if (card.preChemicalArray[`${i}`]) {
                    const temp: Chemicals = card.preChemicalArray[`${i}`];
                    switch (e2.key) {
                      case 'date':
                        dataLine.push((temp.date) ? tempThis.dateToDisplay(temp.date) : '');
                        break;
                      default:
                        dataLine.push('Unknown Key: ' + e2.key);
                        break;
                    }
                  } else {
                    dataLine.push('');
                  }
                }
               }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'thinCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.thinCrews; i++) {
            preset.thinCrews.forEach((e2) => {
              if (e2.value === true) {
                if (card.thinCrewsArray[`${i}`]) {
                  const temp: ThinHoeCrew = card.thinCrewsArray[`${i}`];
                  switch (e2.key) {
                    case 'date':
                      dataLine.push( (temp.date) ? tempThis.dateToDisplay(temp.date) : '');
                      break;
                    case 'crew':
                      dataLine.push( (temp.crew) ? temp.crew : '');
                      break;
                    case 'numEmployees':
                      dataLine.push( (temp.numEmployees != null) ? String(temp.numEmployees) : '');
                      break;
                    case 'hoursWorked':
                      dataLine.push( (temp.hoursWorked != null) ? String(temp.hoursWorked) : '');
                      break;
                    case 'comment':
                      dataLine.push( (temp.comment) ? temp.comment : '');
                      break;
                    case 'cpa':
                      dataLine.push( (temp.cpa != null) ? String((Math.round(temp.cpa * 100) / 100).toFixed(2)) : '');
                      break;
                    default:
                      break;
                  }
                } else {
                  dataLine.push('');
                }
              }
            });
            dataLine.push('');
          }
        } else if (e.key === 'hoeCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.hoeCrews; i++) {
            preset.hoeCrews.forEach((e2) => {
              if (e2.value === true) {
                if (card.hoeCrewsArray[`${i}`]) {
                  const temp: ThinHoeCrew = card.hoeCrewsArray[`${i}`];
                  switch (e2.key) {
                    case 'date':
                      dataLine.push( (temp.date) ? tempThis.dateToDisplay(temp.date) : '');
                      break;
                    case 'crew':
                      dataLine.push( (temp.crew) ? temp.crew : '');
                      break;
                    case 'numEmployees':
                      dataLine.push( (temp.numEmployees != null) ? String(temp.numEmployees) : '');
                      break;
                    case 'hoursWorked':
                      dataLine.push( (temp.hoursWorked != null) ? String(temp.hoursWorked) : '');
                      break;
                    case 'comment':
                      dataLine.push( (temp.comment) ? temp.comment : '');
                      break;
                    case 'cpa':
                      dataLine.push( (temp.cpa != null) ? String((Math.round(temp.cpa * 100) / 100).toFixed(2)) : '');
                      break;
                    default:
                      break;
                  }
                } else {
                  dataLine.push('');
                }
              }
            });
            dataLine.push('');
          }
        } else {
          lastEntryWasSingleValue = true;
          switch (e.key) {
            case 'id':
              dataLine.push( (card.id) ? card.id : '');
              break;
            case 'dateCreated':
              dataLine.push( (card.dateCreated) ? tempThis.dateToDisplay(card.dateCreated) : '');
              break;
            case 'lastUpdated':
              dataLine.push( (card.lastUpdated) ? tempThis.dateToDisplay(card.lastUpdated) : '');
              break;
            case 'ranchName':
              dataLine.push( (card.ranchName) ? card.ranchName : '');
              break;
            case 'lotNumber':
              dataLine.push( (card.lotNumber) ? card.lotNumber : '');
              break;
            case 'fieldID':
              dataLine.push( (card.fieldID) ? String(card.fieldID) : '');
              break;
            case 'closed':
              dataLine.push( (card.closed === true || card.closed === false) ? ((card.closed) ? 'Closed' : 'Open') : '');
              break;
            case 'ranchManagerName':
              dataLine.push( (card.ranchManagerName) ? card.ranchManagerName : '');
              break;
            case 'shippers':
              card.initShippersString();
              dataLine.push(card.shippersString);
              break;
            case 'planterNumber':
              dataLine.push( (card.planterNumber) ? card.planterNumber : '');
              break;
            case 'wetDate':
              dataLine.push( (card.wetDate) ? tempThis.dateToDisplay(card.wetDate) : '');
              break;
            case 'thinDate':
              // dataLine.push( (card.thinDate) ? tempThis.dateToDisplay(card.thinDate) : '');
              dataLine.push('');
              break;
            case 'thinType':
              // dataLine.push( (card.thinType) ? String(card.thinType) : '');
              dataLine.push('');
              break;
            case 'hoeDate':
              // dataLine.push( (card.hoeDate) ? tempThis.dateToDisplay(card.hoeDate) : '');
              dataLine.push('');
              break;
            case 'hoeType':
              // dataLine.push( (card.hoeType) ? String(card.hoeType) : '');
              dataLine.push('');
              break;
            case 'harvestDate':
              dataLine.push( (card.harvestDate) ? tempThis.dateToDisplay(card.harvestDate) : '');
              break;
            case 'cropYear':
              dataLine.push( (card.cropYear) ? String(card.cropYear) : '');
              break;
            case 'totalAcres':
              dataLine.push( (card.totalAcres) ? String(card.totalAcres) : '');
              break;
            case 'dripTape':
              dataLine.push(tempThis.getDripTape(card));
              break;
            case 'comments':
              dataLine.push( (card.comments) ? tempThis.commentsToDisplayString(card.comments) : '');
              break;
            default:
              dataLine.push('Unknown Key: ' + e.key);
              break;
          }
        }
      }
    });
    return dataLine;
  }

  getSubHeader(preset: ExportPreset, numEntries): Array<string> {
    const dataLine = [];
    let lastEntryWasSingleValue = false;
    // Add Top Headers
    preset.card.forEach((e) => {
      if (e.value === true) {
        if (e.key === 'commodities') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.commodities; i++) {
            preset.commodities.forEach((e2) => {
              if (e2.value === true) {
                dataLine.push(e2.display);
              }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'irrigation') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.irrigation; i++) {
            preset.irrigationEntry.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizers') {
                  for (let j = 0; j < numEntries.irrigationEntry.fertilizers; j++) {
                    preset.irrigationEntryFertilizers.forEach((e3) => {
                      if (e3.value === true) {
                        dataLine.push(e3.display);
                      }
                    });
                  }
                } else if (e2.key === 'chemicals') {
                  for (let j = 0; j < numEntries.irrigationEntry.chemicals; j++) {
                    preset.irrigationEntryChemicals.forEach((e3) => {
                      if (e3.value === true) {
                        dataLine.push(e3.display);
                      }
                    });
                  }
                } else {
                  dataLine.push(e2.display);
                }
               }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'tractor') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.tractor; i++) {
            preset.tractorEntry.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizers') {
                  for (let j = 0; j < numEntries.tractorEntry.fertilizers; j++) {
                    preset.tractorEntryFertilizers.forEach((e3) => {
                      if (e3.value === true) {
                        dataLine.push(e3.display);
                      }
                    });
                  }
                } else if (e2.key === 'chemicals') {
                  for (let j = 0; j < numEntries.tractorEntry.chemicals; j++) {
                    preset.tractorEntryChemicals.forEach((e3) => {
                      if (e3.value === true) {
                        dataLine.push(e3.display);
                      }
                    });
                  }
                } else {
                  dataLine.push(e2.display);
                }
               }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'preChemicals') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.preChemicals; i++) {
            preset.preChemicals.forEach((e2) => {
              if (e2.value === true) {
                if (e2.key === 'fertilizer') {
                  preset.preChemicalsFertilizer.forEach((e3) => {
                    if (e3.value === true) {
                      dataLine.push(e3.display);
                    }
                  });
                } else if (e2.key === 'chemical') {
                  preset.preChemicalsChemical.forEach((e3) => {
                    if (e3.value === true) {
                      dataLine.push(e3.display);
                    }
                  });
                } else {
                  dataLine.push(e2.display);
                }
               }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'thinCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.thinCrews; i++) {
            preset.thinCrews.forEach((e2) => {
              if (e2.value === true) {
                dataLine.push(e2.display);
              }
            });
            dataLine.push(''); // Add Spacer
          }
        } else if (e.key === 'hoeCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          for (let i = 0; i < numEntries.card.hoeCrews; i++) {
            preset.hoeCrews.forEach((e2) => {
              if (e2.value === true) {
                dataLine.push(e2.display);
              }
            });
            dataLine.push(''); // Add Spacer
          }
        } else {
          lastEntryWasSingleValue = true;
          dataLine.push(e.display);
        }
      }
    });
    return dataLine;
  }

  getTopHeader(preset: ExportPreset, numEntries): Array<string> {
    const dataLine = [];
    let lastEntryWasSingleValue = true;
    // Add Top Headers
    // For each key value pair in the preset
    preset.card.forEach((e) => {
      // If the value is true (enabled)
      if (e.value === true) {
        // If the key represents a subclass
        if (e.key === 'commodities') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          // Get the number of entries to be displayed (dynamic or static)
          const entryCount: number = numEntries.card.commodities;
          // Get the number of columns needed for each entry (how many properties are enabled for display)
          const colCount: number = preset.commodities.filter((e2) => e2.value === true).length;
          // If there is atleast 1 column needed and one entry to show, display something
          if (colCount > 0) {
            // For each entry
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                // If there is 1 column, display "1st Commodity"
                dataLine.push(this.indexToDisplay(i) + ' Commodity');
              } else {
                // If there is at least 2 columns, display "index", "Commodity"
                dataLine.push(this.indexToDisplay(i), ' Commodity');
                // Followed by whitespaces * the number of remaining columns for this entry
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else if (e.key === 'irrigation') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          // Get the number of entries to be displayed (dynamic or static)
          const entryCount: number = numEntries.card.irrigation;
          // Get the number of columns needed for each entry (how many properties are enabled for display)
          let colCount = preset.irrigationEntry.filter((e2) => e2.value === true).length;

          // If fertilizers or chemicals are enabled, adjust the columns needed accordingly
          if (preset.getPropertyValue('irrigationEntry', 'fertilizers')) {
            // Get the number of columns needed for the subclass (fertilizers)
            const subColCount = preset.irrigationEntryFertilizers.filter((e2) => e2.value === true).length;
            // Add the number of subclass columns needed * the number of subclass entries (dynamic or static) to the total column count
            // Subtract 1 to accomodate for the subclass columns replacing the single columns which referenced it
            colCount += (subColCount * numEntries.irrigationEntry.fertilizers) - 1;
          }
          if (preset.getPropertyValue('irrigationEntry', 'chemicals')) {
            const subColCount = preset.irrigationEntryChemicals.filter((e2) => e2.value === true).length;
            colCount += (subColCount * numEntries.irrigationEntry.chemicals) - 1;
          }
          if (colCount > 0) {
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                dataLine.push(this.indexToDisplay(i) + ' Irrigation');
              } else {
                dataLine.push(this.indexToDisplay(i), 'Irrigation');
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else if (e.key === 'tractor') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          const entryCount: number = numEntries.card.tractor;
          let colCount = preset.tractorEntry.filter((e2) => e2.value === true).length;

          // If fertilizers or chemicals are enabled, adjust the colCount accordingly
          if (preset.getPropertyValue('tractorEntry', 'fertilizers')) {
            const subColCount = preset.tractorEntryFertilizers.filter((e2) => e2.value === true).length;
            colCount += (subColCount * numEntries.tractorEntry.fertilizers) - 1;
          }
          if (preset.getPropertyValue('tractorEntry', 'chemicals')) {
            const subColCount = preset.tractorEntryChemicals.filter((e2) => e2.value === true).length;
            colCount += (subColCount * numEntries.tractorEntry.chemicals) - 1;
          }
          if (colCount > 0) {
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                dataLine.push(this.indexToDisplay(i) + ' Tractor');
              } else {
                dataLine.push(this.indexToDisplay(i), 'Tractor');
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else if (e.key === 'preChemicals') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          const entryCount: number = numEntries.card.preChemicals;
          let colCount = preset.preChemicals.filter((e2) => e2.value === true).length;

          // If fertilizer or chemical is enabled, adjust the colCount accordingly
          if (preset.getPropertyValue('preChemicals', 'fertilizer')) {
            colCount += preset.preChemicalsFertilizer.filter((e2) => e2.value === true).length - 1;
          }
          if (preset.getPropertyValue('preChemicals', 'chemical')) {
            colCount += preset.preChemicalsChemical.filter((e2) => e2.value === true).length - 1;
          }
          if (colCount > 0) {
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                dataLine.push(this.indexToDisplay(i) + ' Pre Plant');
              } else {
                dataLine.push(this.indexToDisplay(i), 'Pre Plant');
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else if (e.key === 'thinCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          // Get the number of entries to be displayed (dynamic or static)
          const entryCount: number = numEntries.card.thinCrews;
          // Get the number of columns needed for each entry (how many properties are enabled for display)
          const colCount: number = preset.thinCrews.filter((e2) => e2.value === true).length;
          // If there is atleast 1 column needed and one entry to show, display something
          if (colCount > 0) {
            // For each entry
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                // If there is 1 column, display "1st Commodity"
                dataLine.push(this.indexToDisplay(i) + ' Thin Crew Entry');
              } else {
                // If there is at least 2 columns, display "index", "Commodity"
                dataLine.push(this.indexToDisplay(i), ' Thin Crew Entry');
                // Followed by whitespaces * the number of remaining columns for this entry
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else if (e.key === 'hoeCrews') {
          if (lastEntryWasSingleValue) {
            dataLine.push('');
            lastEntryWasSingleValue = false;
          }
          // Get the number of entries to be displayed (dynamic or static)
          const entryCount: number = numEntries.card.hoeCrews;
          // Get the number of columns needed for each entry (how many properties are enabled for display)
          const colCount: number = preset.hoeCrews.filter((e2) => e2.value === true).length;
          // If there is atleast 1 column needed and one entry to show, display something
          if (colCount > 0) {
            // For each entry
            for (let i = 1; i <= entryCount; i++) {
              if (colCount === 1) {
                // If there is 1 column, display "1st Commodity"
                dataLine.push(this.indexToDisplay(i) + ' Hoe Crew Entry');
              } else {
                // If there is at least 2 columns, display "index", "Commodity"
                dataLine.push(this.indexToDisplay(i), ' Hoe Crew Entry');
                // Followed by whitespaces * the number of remaining columns for this entry
                for (let j = 2; j < colCount; j++) { dataLine.push(''); }
              }
              dataLine.push(''); // Add Spacer
            }
          }
        } else {
          lastEntryWasSingleValue = true;
          // If the key represents a single point of data
          dataLine.push('');
        }
      }
    });
    return dataLine;
  }

  public indexToDisplay(n: number): string {
    switch (n) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      default:
        if (n > 3 && n < 21) {
          return n + 'th';
        } else {
          return String(n);
        }
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues((data) => {
      Object.keys(CommonLookup).forEach((key) => {
        if ((CommonLookup[`${key}`].type === 'hashTable') || (CommonLookup[`${key}`].type === 'custom')) {
          const temp = [];
          data[`${key}`].forEach((entry) => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(data[`${key}`], key);
        }
      });
      f(sortedCommon);
    });
  }

  // Returns whether or not the key is a attribute to a card
  public isCardAttribute(presetKey: string): boolean {
    // Simple for now
    if (presetKey === 'dripTape') {
      return false;
    } else {
      return true;
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

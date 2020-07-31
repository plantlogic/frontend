import {CardEntryService} from './../../../_api/card-entry.service';
import {FormBuilder, NgModel} from '@angular/forms';
import {TitleService} from '../../../_interact/title.service';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {AuthService} from 'src/app/_auth/auth.service';
import {NavService} from '../../../_interact/nav.service';
import {CommonFormDataService} from '../../../_api/common-form-data.service';
import {componentNeedsResolution} from '@angular/core/src/metadata/resource_loading';

// Models
import {Card} from '../../../_dto/card/card';
import {Chemical} from '../../../_dto/card/chemical';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {TractorEntry} from 'src/app/_dto/card/tractor-entry';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { SSL_OP_PKCS1_CHECK_2 } from 'constants';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService,
              public common: CommonFormDataService) { }

  card: Card = new Card();
  cardShippers = [];
  multiSelectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['bedTypes', 'chemicals', 'chemicalRateUnits', 'commodities',
                'fertilizers', 'shippers', 'tractorOperators', 'tractorWork'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Create Card');
    this.card.ranchManagerName = this.auth.getName();
    this.card.lotNumber = '';
    this.initCommon((c) => {
      this.commonKeys.forEach((key) => {
        tempThis[`${key}`] = c[`${key}`];
      });
      this[`ranches`] = c[`ranches`];
    });
  }

  private addCommodities(): void {
    this.card.commodityArray.push(new Commodities());
  }

  private addTractor(): void {
    if (this.card.tractorArray.length < 1) {
      const t = new TractorEntry();
      this.card.tractorArray.push(t);
    }
  }

  private addTractorChemical(): void {
    const length = this.card.tractorArray.length;
    if (length > 0 && !this.card.tractorArray[0].chemicalsFull()) {
      this.card.tractorArray[0].chemicalArray.push(new Chemical());
    }
  }

  private addTractorFertilizer(): void {
    const length = this.card.tractorArray.length;
    if (length > 0 && !this.card.tractorArray[0].fertilizersFull()) {
      this.card.tractorArray[0].fertilizerArray.push(new Chemical());
    }
  }

  public dataListOptionValueToID(optionValue, dataListID) {
    const option = document.querySelector('#' + dataListID + ' [value="' + optionValue + '"]') as HTMLElement;
    return (option) ? option.id : null;
  }

  public fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      // console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  getSelectedShippers(): Array<string> {
    try {
      return (this.cardShippers) ? this.cardShippers.map((e) => e.id) : [];
    } catch (e) {
      AlertService.newBasicAlert('Error When Reading Shippers', true);
      return [];
    }
  }

  public getVarieties(commodityID) {
    try {
      const searchResult = this[`commodities`].find((e) => e.id === commodityID).value.value;
      return searchResult;
    } catch (e) {
      return [];
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues((data) => {
      this.commonKeys.forEach((key) => {
        if (CommonLookup[`${key}`].type === 'hashTable') {
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
      sortedCommon[`ranches`] = data[`ranches`].filter((e) => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  public submit() {
    // Shallow Copy Card Object
    const card = new Card().copyConstructor(this.card);
    if (!this.submitRanchCheck(card.ranchName)
        || !this.submitCommoditiesCheck(card.commodityArray)
        || !this.submitTractorsCheck(card.tractorArray)) {
       return false;
      }

    // Replace Lot Number Whitespace
    card.lotNumber = card.lotNumber.replace(/\s/g, '');
    card.shippers = this.getSelectedShippers();
    // Create Card
    this.cardEntryService.createCard(card).subscribe(
      (data) => {
        if (data.success) {
          AlertService.newBasicAlert('Card saved successfully!', false);
          this.nav.goBack();
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  submitChemicalsCheck(chemicals: Chemical[]): boolean {
    for (const c of chemicals) {
      if (!c.name || !this[`chemicals`].find((c2) => c2.id === c.name)) {
        AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
        return false;
      }
      if (!c.rate) {
        AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
        return false;
      }
      if (!c.unit || !this[`chemicalRateUnits`].find((c2) => c2.id === c.unit)) {
        AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
        return false;
      }
    }
    return true;
  }

  submitCommoditiesCheck(commodities: Commodities[]): boolean {
    for (const c of commodities) {
      if (!c.commodity || !this[`commodities`].find((c2) => {
        return c2.id === c.commodity && (c.variety) ? c2.value.value.includes(c.variety) : true;
      })) {
        AlertService.newBasicAlert('Invalid Commodity Information - please fix and try again.', true);
        return false;
      }
      if (!c.bedType || !this[`bedTypes`].find((c2) => c2.id === c.bedType)) {
        AlertService.newBasicAlert('Invalid Commodity Bed Type - please fix and try again.', true);
        return false;
      }
    }
    return true;
  }

  submitFertilizersCheck(fertilizers: Chemical[]): boolean {
    for (const f of fertilizers) {
      if (!f.name || !this[`fertilizers`].find((c2) => c2.id === f.name)) {
        AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
        return false;
      }
      if (!f.rate) {
        AlertService.newBasicAlert('Invalid Fertilizer Rate Entered - please fix and try again.', true);
        return false;
      }
      if (!f.unit || !this[`chemicalRateUnits`].find((c2) => c2.id === f.unit)) {
        AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
        return false;
      }
    }
    return true;
  }

  submitRanchCheck(ranchName?: string) {
    // Check Ranch Info
    if (!ranchName || !(this[`ranches`].find((r) => r.id === ranchName))) {
      AlertService.newBasicAlert('Invalid Ranch - please fix and try again.', true);
      return false;
    }
    return true;
  }

  submitTractorsCheck(tractors: TractorEntry[]): boolean {
    // Check Tractor Info
    for (const t of tractors) {
      t.workDate = (new Date(t.workDate)).valueOf();
      const operatorID = this.dataListOptionValueToID(t.operator, 'tractorOperators');
      if (!operatorID) {
        AlertService.newBasicAlert('Invalid Tractor Operator - please fix and try again.', true);
        return false;
      }
      t.operator = operatorID;
      // Check Tractor Work
      if (!t.workDone || !this[`tractorWork`].find((tw) => tw.id === t.workDone)) {
        AlertService.newBasicAlert('Invalid Tractor Work Entered - please fix and try again.', true);
        return false;
      }
      // Check Chemical
      if (t.chemicalArray) {
        if (!this.submitChemicalsCheck(t.chemicalArray)) { return false; }
      }
      // Check Fertilizer Info
      if (t.fertilizerArray) {
        if (!this.submitFertilizersCheck(t.fertilizerArray)) { return false; }
      }
    }
    return true;
  }
}

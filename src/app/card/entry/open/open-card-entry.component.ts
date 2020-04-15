import {Component, OnInit, ViewChildren, EventEmitter} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardEntryService} from '../../../_api/card-entry.service';
import {CollapseComponent} from 'angular-bootstrap-md';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { AuthService } from 'src/app/_auth/auth.service';
import { Alert } from 'src/app/_interact/alert/alert';

@Component({
  selector: 'app-open-card-entry',
  templateUrl: './open-card-entry.component.html',
  styleUrls: ['./open-card-entry.component.scss']
})
export class OpenCardEntryComponent implements OnInit {
  @ViewChildren(CollapseComponent) collapses: CollapseComponent[];

  constructor(private titleService: TitleService, private cardService: CardEntryService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService,
              public common: CommonFormDataService) { }

  card: Card;
  datesSet: boolean;

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['bedTypes', 'chemicals', 'chemicalRateUnits', 'commodities',
  'fertilizers', 'irrigators', 'irrigationMethod', 'shippers', 'tractorOperators', 'tractorWork'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('View Card');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      tempThis.route.params.subscribe(data => tempThis.loadCardData(data.id));
    });
  }

  private cardIDsToValues(card: Card): Card {
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    const shippers = [];
    card.shippers.forEach(e => {
      shippers.push(this.findCommonValue('shippers', ['value'], e));
    });
    card.shippers = shippers;
    card.commodityArray.forEach(e => {
      e.commodity = this.findCommonValue('commodities', ['value', 'key'], e.commodity);
      e.bedType = this.findCommonValue('bedTypes', ['value'], e.bedType);
    });
    card.preChemicalArray.forEach(e => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.postChemicalArray.forEach(e => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.tractorArray.forEach(e => {
      e.workDone = this.findCommonValue('tractorWork', ['value'], e.workDone);
      e.operator = this.findCommonValue('tractorOperators', ['value'], e.operator);
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.irrigationArray.forEach(e => {
      e.method = this.findCommonValue('irrigationMethod', ['value'], e.method);
      e.irrigator = this.findCommonValue('irrigators', ['value'], e.irrigator);
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    return card;
  }

  /*
    Searches common values in [key] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find(e => {
      return e.id === targetID;
    });
    try {
      valuePropertyArr.forEach(p => {
        commonValue = commonValue[p];
      });
    } catch (e) {
      console.log(e);
    }
    return (commonValue) ? commonValue : 'Unknown ' + key + ' ID';
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
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public getVarieties(commodityID) {
    try {
      const searchResult = this[`commodities`].find(e => e.id === commodityID).value.value;
      return searchResult;
    } catch (e) {
      return [];
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
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
      sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  private loadCardData(id: string) {
    this.cardService.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = (new Card()).copyConstructor(data.data);

          // For display purposes, change any common IDs to their values
          this.card = this.cardIDsToValues(this.card);
          this.card.initShippersString();
          this.card.initCommodityString();
          this.card.initTotalAcres();
          this.datesSet = (this.card.wetDate || this.card.thinDate || this.card.hoeDate) ? true : false;
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
          this.nav.goBack();
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        this.nav.goBack();
      }
    );
  }

  private saveDates(): void {
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Confirm Dates';
    newAlert.message = 'This will save the hoe, thin, and wet dates. This can only be done once on the entry side. Continue?';
    newAlert.actionName = 'Confirm';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();

    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      let changed = 0;
      if (this.card.wetDate) {
        this.card.wetDate = (new Date(this.card.wetDate)).valueOf();
        changed++;
      }
      if (this.card.thinDate) {
        this.card.thinDate = (new Date(this.card.thinDate)).valueOf();
        changed++;
      }
      if (this.card.hoeDate) {
        this.card.hoeDate = (new Date(this.card.hoeDate)).valueOf();
        changed++;
      }
      this.datesSet = true;
      if (changed > 0) {
        this.cardService.addWetThinHoeData(this.card.id, this.card).subscribe();
      }
    });
    AlertService.newAlert(newAlert);
  }
}

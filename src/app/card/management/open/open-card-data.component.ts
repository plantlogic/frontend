import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Card, WorkType} from '../../../_dto/card/card';
import {TitleService} from '../../../_interact/title.service';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import {CardViewService} from '../../../_api/card-view.service';
import {CardEditService} from '../../../_api/card-edit.service';
import {AuthService} from '../../../_auth/auth.service';
import {PlRole} from '../../../_dto/user/pl-role.enum';
import {Alert} from '../../../_interact/alert/alert';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {NgModel} from '@angular/forms';
import {TractorEntry} from '../../../_dto/card/tractor-entry';
import {IrrigationEntry} from '../../../_dto/card/irrigation-entry';
import {Chemical} from '../../../_dto/card/chemical';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {CommonFormDataService} from 'src/app/_api/common-form-data.service';
import { CommonLookup } from 'src/app/_api/common-data.service';

@Component({
  selector: 'app-open-card',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService, public common: CommonFormDataService) { }

  card: Card;
  editable: boolean;
  editing = false;

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['bedTypes', 'chemicals', 'chemicalRateUnits', 'commodities',
                'fertilizers', 'irrigationMethod', 'irrigators', 'tractorOperators',
                'tractorWork'];


  hoeDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    defaultDate: null
  };
  harvestDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    defaultDate: null
  };
  thinDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    defaultDate: null
  };
  wetDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    defaultDate: null
  };

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('View Card');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
    });
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT);
  }

  private addTractorData(): void {
    this.card.tractorArray.push(new TractorEntry());
  }

  private addIrrigationData(): void {
    this.card.irrigationArray.push(new IrrigationEntry());
  }

  private addPreChemicals(): void {
    this.card.preChemicalArray.push(new Chemicals());
  }

  private addPostChemicals(): void {
    this.card.postChemicalArray.push(new Chemicals());
  }

  private addCommodities(): void {
    this.card.commodityArray.push(new Commodities());
  }

  private clearChanges(): void {
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Clear Changes';
    newAlert.message = 'This will clear all changes made to the card, and cannot be undone. Continue?';
    newAlert.actionName = 'Clear';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.loadCardData();
      this.toggleEditing();
    });

    AlertService.newAlert(newAlert);
  }

  public dataListOptionValueToID(optionValue, dataListID) {
    const option = document.querySelector('#' + dataListID + ' [value="' + optionValue + '"]') as HTMLElement;
    return (option) ? option.id : null;
  }

  private datePickr(workDate: number): FlatpickrOptions {
    return {
      enableTime: true,
      dateFormat: 'm-d-Y H:i',
      defaultDate: new Date(workDate)
    };
  }  

  private deleteCard() {
    const newAlert = new Alert();
    newAlert.color = 'danger';
    newAlert.title = 'WARNING: Deleting Card Permanently';
    newAlert.message = 'Are you sure you want to delete this card? This action cannot be reversed.';
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.actionName = 'Permanently Delete';
    newAlert.actionClosesAlert = true;
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.deleteCard(this.card.id).subscribe(data => {
          if (data.success) {
            AlertService.newBasicAlert('Card deleted successfully!', false);
            this.nav.goBack();
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });

    AlertService.newAlert(newAlert);
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return this[key];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public getRanchName(ID) {
    return this[`ranches`].find(r => r.id === ID).value;
  }

  public getVarieties(commodityID) {
    try {
      const searchResult = this[`commodities`].find(e => e.id === commodityID).value.value;
      return searchResult;
    } catch (e) {
      return [];
    }
  }

  public iDToDataListOption(commonID, commonKey) {
    const values = this.getCommon(commonKey);
    for (let i = 0; i < values.length; i++) {
      if (values[i].id === commonID) {
        return (i+1) + ' - ' + values[i].value;
      }
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

  initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
  }

  private loadCardData() {
    const tempThis = this;
    this.route.params.subscribe(cr => {
      this.cardView.getCardById(cr.id).subscribe(
        data => {
          if (data.success) {
            this.card = (new Card()).copyConstructor(data.data);
            
            // Fix Datalist Display
            this.card.tractorArray.forEach(e => {
              e.operator = tempThis.iDToDataListOption(e.operator, 'tractorOperators');
            })
            this.card.irrigationArray.forEach(e => {
              e.irrigator = tempThis.iDToDataListOption(e.irrigator, 'irrigators');
            })
            
            if (this.card.hoeDate) {
              this.hoeDatePickr.defaultDate = new Date(this.card.hoeDate);
            }
            if (this.card.harvestDate) {
              this.harvestDatePickr.defaultDate = new Date(this.card.harvestDate);
            }
            if (this.card.thinDate) {
              this.thinDatePickr.defaultDate = new Date(this.card.thinDate);
            }
            if (this.card.wetDate) {
              this.wetDatePickr.defaultDate = new Date(this.card.wetDate);
            }

            this.card.initTotalAcres();
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
    });
  }

  private newChemical(): Chemical {
    return new Chemical();
  }

  private saveChanges(): void {
    // Validate
    const card = this.validateAndFix(this.card);
    if (!card) { return; }

    // If Valid, continue
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Save Card';
    newAlert.message = 'This will save the card, overwriting what is in the database. This cannot be undone. Continue?';
    newAlert.actionName = 'Save';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>(); 

    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.updateCard(card).subscribe(data => {
          if (data.success) {
            AlertService.newBasicAlert('Change saved successfully!', false);
            this.loadCardData();
            this.toggleEditing();
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });
    AlertService.newAlert(newAlert);    
  }

  private toggleCard() {
    const newAlert = new Alert();
    newAlert.color = 'primary';
    if (this.card.closed) {
      newAlert.title = 'Reopen Card';
      newAlert.message = 'This will reopen a closed card, allowing it to be edited again. Continue?';
      newAlert.actionName = 'Reopen';
    } else {
      newAlert.title = 'Set Card as Harvested';
      newAlert.message = 'This will mark the card as "Harvested", removing it from the "entry" tab. Continue?';
      newAlert.actionName = 'Close Card';
    }
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.setCardState(this.card.id, !this.card.closed).subscribe(data => {
          if (data.success) {
            this.card.closed = !this.card.closed;
            AlertService.newBasicAlert('Change saved successfully!', false);
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });

    AlertService.newAlert(newAlert);
  }

  private toggleEditing(): void {
    this.editing = !this.editing;
  }

  private validateAndFix(c: Card) {
    try {
      const card = (new Card()).copyConstructor(c);
      // Check Ranch Info
      if (!card.ranchName || !(this[`ranches`].find(r => r.id === card.ranchName))) {
        AlertService.newBasicAlert('Invalid Ranch - please fix and try again.', true);
        return false;
      }
      // Check Commodity Info
      for (const c of card.commodityArray) {
        if (!c.commodity || !this[`commodities`].find(c2 => {
          return c2.id === c.commodity && c2.value.value.includes(c.variety);
        })) {
          AlertService.newBasicAlert('Invalid Commodity Information - please fix and try again.', true);
          return false;
        }
        if (c.bedType && !this[`bedTypes`].find(c2 => c2.id === c.bedType)) {
          AlertService.newBasicAlert('Invalid Commodity Bed Type - please fix and try again.', true);
          return false;
        }
      }
      // Check Chemical / Fertilizer Info
      for (const c of card.preChemicalArray) {
        c.date = (new Date(c.date)).valueOf();
        if (c.chemical) {
          if (!c.chemical.name || !this[`chemicals`].find(c2 => c2.id === c.chemical.name)) {
            AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
            return false;
          }
          if (!c.chemical.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.chemical.unit)) {
            AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
            return false;
          }
        }
        if (c.fertilizer) {
          if (!c.fertilizer.name || !this[`fertilizers`].find(c2 => c2.id === c.fertilizer.name)) {
            AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
            return false;
          }
          if (!c.fertilizer.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.fertilizer.unit)) {
            AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
            return false;
          }
        }
        if (!c.chemical && !c.fertilizer) {
          AlertService.newBasicAlert('No Chemical or Fertilizer Entered - please fix and try again.', true);
          return false;
        }
      }
      for (const c of card.postChemicalArray) {
        c.date = (new Date(c.date)).valueOf();
        if (c.chemical) {
          if (!c.chemical.name || !this[`chemicals`].find(c2 => c2.id === c.chemical.name)) {
            AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
            return false;
          }
          if (!c.chemical.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.chemical.unit)) {
            AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
            return false;
          }
        }
        if (c.fertilizer) {
          if (!c.fertilizer.name || !this[`fertilizers`].find(c2 => c2.id === c.fertilizer.name)) {
            AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
            return false;
          }
          if (!c.fertilizer.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.fertilizer.unit)) {
            AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
            return false;
          }
        }
        if (!c.chemical && !c.fertilizer) {
          AlertService.newBasicAlert('No Chemical or Fertilizer Entered - please fix and try again.', true);
          return false;
        }
      }
      // Check Tractor Info
      for (const t of card.tractorArray) {
        t.workDate = (new Date(t.workDate)).valueOf();
        const operatorID = this.dataListOptionValueToID(t.operator, 'tractorOperators');
        if (!operatorID) {
          AlertService.newBasicAlert('Invalid Tractor Operator - please fix and try again.', true);
          return false;
        }
        t.operator = operatorID;
      }
      // Check Irrigation Info
      for (const e of card.irrigationArray) {
        e.workDate = (new Date(e.workDate)).valueOf();
        const irrigatorID = this.dataListOptionValueToID(e.irrigator, 'irrigators');
        if (!irrigatorID) {
          AlertService.newBasicAlert('Invalid Irrigator - please fix and try again.', true);
          return false;
        }
        e.irrigator = irrigatorID;
        if (!e.method || !this[`irrigationMethod`].find(e2 => e2.id === e.method)) {
          AlertService.newBasicAlert('Invalid Irrigation Method Entered - please fix and try again.', true);
          return false;
        }
      }

      // Replace Lot Number Whitespace
      card.lotNumber = card.lotNumber.replace(/\s/g, '');
      // Fix Other flatPickr date formats
      card.hoeDate = (this.card.hoeDate) ? (new Date(this.card.hoeDate)).valueOf() : null;
      card.harvestDate = (this.card.harvestDate) ? (new Date(this.card.harvestDate)).valueOf() : null;
      card.thinDate = (this.card.thinDate) ? (new Date(this.card.thinDate)).valueOf() : null;
      card.wetDate = (this.card.wetDate) ? (new Date(this.card.wetDate)).valueOf() : null;
      return card;
    } catch (e) {
      AlertService.newBasicAlert('Error When Validating Card Data', true);
      console.log(e);
      return false;
    }
  }
}

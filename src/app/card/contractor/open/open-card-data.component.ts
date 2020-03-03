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

@Component({
  selector: 'app-open-card-contractor',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardContractorComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService, public common: CommonFormDataService) { }

  card: Card;
  editable: boolean;
  editing = false;

  @ViewChild('ranchName') public ranchName: NgModel;
  @ViewChild('cropYear') public cropYear: NgModel;

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
    this.titleService.setTitle('View Card');
    this.loadCardData();
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT);
  }

  private loadCardData() {
    this.route.params.subscribe(cr => {
      this.cardView.getCardById(cr.id).subscribe(
        data => {
          if (data.success) {
            this.card = (new Card()).copyConstructor(data.data);

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

  private saveChanges(): void {
    if (this.ranchName.invalid || (this.card.cropYear < 1000 || this.card.cropYear > 9999)) {
      AlertService.newBasicAlert('There are some invalid values - please fix before saving.', true);
    } else {
      const operators = this.initTractorOperators();
      for (const t of this.card.tractorArray) {
        if ((t.operator) && (!operators.includes(t.operator))) {
          AlertService.newBasicAlert('Invalid tractor operator selected, please select one from the list provided', true);
          return;
        }
      }
      const irrigators = this.initIrrigators();
      for (const t of this.card.irrigationArray)  {
        if ((t.irrigator) && (!irrigators.includes(t.irrigator))) {
          AlertService.newBasicAlert('Invalid irrigator selected, please select one from the list provided', true);
          return;
        }
      }
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

      // Fix flatPickr date format
      if (this.card.hoeDate) {
        this.card.hoeDate = (new Date(this.card.hoeDate)).valueOf();
      }
      if (this.card.harvestDate) {
        this.card.harvestDate = (new Date(this.card.harvestDate)).valueOf();
      }
      if (this.card.thinDate) {
        this.card.thinDate = (new Date(this.card.thinDate)).valueOf();
      }
      if (this.card.wetDate) {
        this.card.wetDate = (new Date(this.card.wetDate)).valueOf();
      }
      this.card.preChemicalArray.map(x => x.date = (new Date(x.date).valueOf()));
      this.card.postChemicalArray.map(x => x.date = (new Date(x.date).valueOf()));
      this.card.tractorArray.map(x => x.workDate = (new Date(x.workDate).valueOf()));
      this.card.irrigationArray.map(x => x.workDate = (new Date(x.workDate).valueOf()));

      // Remove all whitespace from card.lotNumber
      this.card.lotNumber = this.card.lotNumber.replace(/\s/g, '');

      newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
        this.cardEdit.updateCard(this.card).subscribe(data => {
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
  }

  private datePickr(workDate: number): FlatpickrOptions {
    return {
      enableTime: true,
      dateFormat: 'm-d-Y H:i',
      defaultDate: new Date(workDate)
    };
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

  private newChemical(): Chemical {
    return new Chemical();
  }

  getRanches(): Array<string> {
    try {
      return this.common.getValues('ranches').filter(r => this.auth.getRanchAccess().includes(r)).sort();
    } catch (E) {
      // Block error messages while data is loading
     }
  }

  initBedTypes(): Array<string> {
    try {
      return this.common.getValues('bedTypes').sort();
    } catch { console.log('Error when initializing bed types'); }
  }

  initChemicals(): Array<string> {
    try {
      return this.common.getValues('chemicals');
    } catch { console.log('Error when initializing chemicals'); }
  }

  initFertilizers(): Array<string> {
    try {
      return this.common.getValues('fertilizers');
    } catch { console.log('Error when initializing fertilizers'); }
  }

  initRateUnits(): Array<string> {
    try {
      return this.common.getValues('chemicalRateUnits').sort();
    } catch { console.log('Error when initializing rate units'); }
  }

  initCommodities(): Array<string> {
    try {
      return this.common.getMapKeys('commodities').sort();
    } catch { console.log('Error when initializing commodities'); }
  }

  initCommodityValues(p): Array<string> {
    try {
      return this.common.getMapValues('commodities', p.commodity).sort();
    } catch { console.log('Error when initializing commodity values for ' + p); }
  }

  initIrrigationMethods(): Array<string> {
    try {
      return this.common.getValues('irrigationMethod').sort();
    } catch { console.log('Error when initializing irrigation methods'); }
  }

  initIrrigators(): Array<string> {
    try {
      return this.common.getValues('irrigators').sort();
    } catch { console.log('Error when initializing irrigators'); }
  }

  initTractorOperators(): Array<string> {
    try {
      return this.common.getValues('tractorOperators').sort();
    } catch { console.log('Error when initializing tractor operators'); }
  }

  initTractorWork(): Array<string> {
    try {
      return this.common.getValues('tractorWork').sort();
    } catch { console.log('Error when initializing tractor work types'); }
  }

  initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
  }
}

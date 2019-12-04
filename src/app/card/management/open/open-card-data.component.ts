import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Card} from '../../../_dto/card/card';
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
import {Chemical, ChemicalUnit} from '../../../_dto/card/chemical';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';

@Component({
  selector: 'app-open-card',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService) { }

  card: Card;
  editable: boolean;
  editing = false;
  rateUnits: Array<string>;

  @ViewChild('ranchName') public ranchName: NgModel;
  @ViewChild('cropYear') public cropYear: NgModel;

  hoeDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y'
  };
  harvestDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y'
  };
  thinDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y'
  };
  wetDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y'
  };


  ngOnInit() {
    this.titleService.setTitle('View Card');
    this.loadCardData();
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT);
    this.rateUnits = this.initRateUnits();
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
    console.log(this.card);

    if (this.ranchName.invalid || (this.card.cropYear < 1000 || this.card.cropYear > 9999)) {
      AlertService.newBasicAlert('There are some invalid values - please fix before saving.', true);
    } else {
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
      this.card.hoeDate = (new Date(this.card.hoeDate)).valueOf();
      this.card.harvestDate = (new Date(this.card.harvestDate)).valueOf();
      this.card.thinDate = (new Date(this.card.thinDate)).valueOf();
      this.card.wetDate = (new Date(this.card.wetDate)).valueOf();
      this.card.tractorArray.map(x => x.workDate = (new Date(x.workDate).valueOf()));
      this.card.irrigationArray.map(x => x.workDate = (new Date(x.workDate).valueOf()));

      // Remove all whitespace from card.lotNumber
      this.card.lotNumber = this.card.lotNumber.replace(/\s/g, "");

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

  initRateUnits(): Array<string> {
    const keys = Object.keys(ChemicalUnit);
    return keys.slice(keys.length / 2);
  }
}

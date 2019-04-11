import {Component, EventEmitter, OnInit} from '@angular/core';
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
    if (this.card.isClosed) {
      newAlert.title = 'Reopen Card';
      newAlert.message = 'This will reopen a closed card, allowing it to be edited again. Continue?';
      newAlert.actionName = 'Reopen';
    } else {
      newAlert.title = 'Close Card';
      newAlert.message = 'This will close the card, removing it from the "entry" tab. Continue?';
      newAlert.actionName = 'Close Card';
    }
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.setCardState(this.card.id, !this.card.isClosed).subscribe(data => {
          if (data.success) {
            this.card.isClosed = !this.card.isClosed;
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

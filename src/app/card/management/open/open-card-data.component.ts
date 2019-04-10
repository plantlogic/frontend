import {Component, EventEmitter, OnInit} from '@angular/core';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Card} from '../../../_dto/card/card';
import {TitleService} from '../../../_interact/title.service';
import {CardEntryService} from '../../../_api/card-entry.service';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import {CardViewService} from '../../../_api/card-view.service';
import {CardEditService} from '../../../_api/card-edit.service';
import {AuthService} from '../../../_auth/auth.service';
import {PlRole} from '../../../_dto/user/pl-role.enum';
import {Alert} from '../../../_interact/alert/alert';

@Component({
  selector: 'app-open-card',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService) { }

  untouchedCard: Card;
  card: Card;
  editable: boolean;

  ngOnInit() {
    this.titleService.setTitle('View Card');
    this.route.params.subscribe(data => this.loadCardData(data.id));
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT);
  }

  private loadCardData(id: string) {
    this.cardView.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = (new Card()).copyConstructor(data.data);
          this.untouchedCard = (new Card()).copyConstructor(data.data);
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

  private deleteCard() {
    if (this.editable) {
      const newAlert = new Alert();
      newAlert.color = 'danger';
      newAlert.title = 'WARNING: Deleting Card Permanently';
      newAlert.message = 'Are you sure you want to delete this card? This action cannot be reversed.';
      newAlert.timeLeft = undefined;
      newAlert.blockPageInteraction = true;
      newAlert.actionName = 'Permanently Delete';
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
    } else {
      AlertService.newBasicAlert('You don\'t have permission to delete cards.', true);
    }
  }

  private toggleCard() {
    if (this.editable) {
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
      newAlert.timeLeft = undefined;
      newAlert.blockPageInteraction = true;
      newAlert.closeName = 'Cancel';
      newAlert.action$ = new EventEmitter<null>();
      newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
        this.untouchedCard.isClosed = !this.untouchedCard.isClosed;
        this.cardEdit.updateCard(this.untouchedCard).subscribe(data => {
            if (data.success) {
              this.card.isClosed = !this.card.isClosed;
              AlertService.newBasicAlert('Card Edited Successfully!', false);
            } else {
              this.untouchedCard.isClosed = !this.untouchedCard.isClosed;
              AlertService.newBasicAlert('Error: ' + data.error, true);
            }
          },
          failure => {
            this.untouchedCard.isClosed = !this.untouchedCard.isClosed;
            AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          });
      });

      AlertService.newAlert(newAlert);
    } else {
      AlertService.newBasicAlert('You don\'t have permission to delete cards.', true);
    }
  }
}

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
import {NgModel} from '@angular/forms';
import {TractorEntry} from '../../../_dto/card/tractor-entry';
import {IrrigationEntry} from '../../../_dto/card/irrigation-entry';
import {Chemical} from '../../../_dto/card/chemical';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {CommonFormDataService} from 'src/app/_api/common-form-data.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { Comment } from 'src/app/_dto/card/comment';
import { ThinHoeCrew } from 'src/app/_dto/card/thinHoeCrew';

@Component({
  selector: 'app-open-thin-hoe-card',
  templateUrl: './open-card-thinHoe.component.html',
  styleUrls: ['./open-card-thinHoe.component.scss']
})
export class OpenCardThinHoeComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService, private common: CommonFormDataService) { }

  card: Card;
  editable: boolean;
  editing = false;

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['commodities', 'thinHoeCrew'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('View Card');
    this.initCommon((c) => {
      this.commonKeys.forEach((key) => {
        tempThis[`${key}`] = c[`${key}`];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
    });
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT)
                 || this.auth.hasPermission(PlRole.TH_EDIT);
  }

  public addHoeCrewEntry() {
    this.card.hoeCrewsArray.push(new ThinHoeCrew());
  }

  public addThinCrewEntry() {
    this.card.thinCrewsArray.push(new ThinHoeCrew());
  }

  public clearChanges(): void {
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
      if (this.editing) { this.toggleEditing(); }
    });
    AlertService.newAlert(newAlert);
  }

  public collapseToggle(htmlId: string): void {
    const element = document.getElementById(htmlId);
    if (element) {element.classList.toggle('collapse'); }
  }

  public fixDate(d: string): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = Number(parts[2]);
    const month = Number(parts[1]) - 1; // 0 based
    const year = Number(parts[0]);
    return new Date(year, month, day);
  }

  public getCommon(key): Array<any> {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      // console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public getRanchName(id: string): string {
    return this[`ranches`].find((r) => r.id === id).value;
  }

  private initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues((data) => {
      this.commonKeys.forEach((key) => {
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
      sortedCommon[`ranches`] = data[`ranches`].filter((e) => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  public isCollapsed(htmlId: string): boolean {
    const element = document.getElementById(htmlId);
    if (element) {
      return element.classList.contains('collapse');
    } else {
      return true;
    }
  }

  private loadCardData(): void {
    const tempThis = this;
    this.route.params.subscribe((cr) => {
      this.cardView.getCardById(cr.id).subscribe(
        (data) => {
          if (data.success) {
            tempThis.card = (new Card()).copyConstructor(data.data);
            tempThis.card.initTotalAcres();
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
            tempThis.nav.goBack();
          }
        },
        (failure) => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          tempThis.nav.goBack();
        }
      );
    });
  }

  public saveChanges(): void {
    const card = (new Card()).copyConstructor(this.card);
    // Do we want to validate Thinning and Hoeing Sections?
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
      this.cardEdit.setCardThinning(card.id, card.thinCrewsArray).subscribe((data) => {
        if (data.success) {
          this.cardEdit.setCardHoeing(card.id, card.hoeCrewsArray).subscribe((data2) => {
            if (data2.success) {
              AlertService.newBasicAlert('Changes saved successfully!', false);
              this.loadCardData();
              if (this.editing) { this.toggleEditing(); }
            } else {
                AlertService.newBasicAlert('Error: ' + data2.error, true);
            }
          }, (failure) => AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true));
        } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      }, (failure) => AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true));
    });
    AlertService.newAlert(newAlert);
  }

  public toggleEditing(): void {
    this.editing = !this.editing;
  }
}

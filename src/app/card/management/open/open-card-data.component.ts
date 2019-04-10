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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IrrigationEntry} from '../../../_dto/card/irrigation-entry';
import {TractorEntry} from '../../../_dto/card/tractor-entry';
import {FlatpickrOptions} from 'ng2-flatpickr';

@Component({
  selector: 'app-open-card',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardDataComponent implements OnInit {
  form: FormGroup;

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService,
              private fb: FormBuilder) {
    this.form = this.fb.group({
      // username: ['', [Validators.required, Validators.minLength(4)]],
      // email: ['', [Validators.required, Validators.email]],
      // realname: ['', Validators.required],
      // roles: this.fb.array([0, 0]),

      // bedCount	[integer($int32)]
      // bedCount: this.fb.array([]),
      // bedType	integer($int32)
      bedType: ['', []],
      // commodity	[string]
      // commodity: this.fb.array([]),
      // cropAcres	[number($float)]
      // cropAcres: this.fb.array([]),
      // cropYear	integer($int32)
      cropYear: ['', [Validators.min(1000), Validators.max(9999)]],
      // dacthalRate	number($float)
      dacthalRate: ['', []],
      // diaznonRate	number($float)
      diaznonRate: ['', []],
      // fieldID	integer($int32)
      fieldID: ['', []],
      // harvestDate	string($date-time)
      harvestDate: ['', []],
      // hoeDate	string($date-time)
      hoeDate: ['', []],
      // kerbRate	number($float)
      kerbRate: ['', []],
      // lorsbanRate	number($float)
      lorsbanRate: ['', []],
      // lotNumber	string
      lotNumber: ['', []],
      // ranchManagerName	string
      ranchManagerName: ['', []],
      // ranchName	string
      ranchName: ['', [Validators.required, Validators.minLength(1)]],
      // seedLotNumber	[integer($int32)]
      // seedLotNumber: this.fb.array([]),
      // thinDate	string($date-time)
      thinDate: ['', []],
      // totalAcres	number($float)
      totalAcres: ['', []],
      // variety	[string]
      // variety: this.fb.array([]),
      // wetDate	string($date-time)
      wetDate: ['', []],

      // irrigationData	[IrrigationData{...}]
      // irrigationData: this.fb.array([]),
      // tractorData	[TractorData{...}]
      // tractorData: this.fb.array([])
    });
  }

  hoeDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    allowInput: true
  };
  harvestDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    allowInput: true
  };
  thinDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    allowInput: true
  };
  wetDatePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    allowInput: true
  };

  card: Card;
  editable: boolean;

  ngOnInit() {
    this.titleService.setTitle('View Card');
    this.route.params.subscribe(data => this.loadCardData(data.id));
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT);
    this.toggleEditing(false);
  }

  private loadCardData(id: string) {
    this.cardView.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = (new Card()).copyConstructor(data.data);
          this.loadCardToForm(this.card);
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

  private loadCardToForm(c: Card): void {
    this.form.get('bedType').setValue(c.bedType);
    this.form.get('cropYear').setValue(c.cropYear);
    this.form.get('dacthalRate').setValue(c.dacthalRate);
    this.form.get('diaznonRate').setValue(c.diaznonRate);
    this.form.get('fieldID').setValue(c.fieldID);
    this.form.get('kerbRate').setValue(c.kerbRate);
    this.form.get('lorsbanRate').setValue(c.lorsbanRate);
    this.form.get('lotNumber').setValue(c.lotNumber);
    this.form.get('ranchManagerName').setValue(c.ranchManagerName);
    this.form.get('ranchName').setValue(c.ranchName);
    this.form.get('totalAcres').setValue(c.totalAcres);

    if (c.hoeDate) {
      this.form.get('hoeDate').setValue(c.hoeDate);
      this.hoeDatePickr.defaultDate = new Date(c.hoeDate);
    }
    if (c.harvestDate) {
      this.form.get('harvestDate').setValue(c.harvestDate);
      this.harvestDatePickr.defaultDate = new Date(c.harvestDate);
    }
    if (c.thinDate) {
      this.form.get('thinDate').setValue(c.thinDate);
      this.thinDatePickr.defaultDate = new Date(c.thinDate);
    }
    if (c.wetDate) {
      this.form.get('wetDate').setValue(c.wetDate);
      this.wetDatePickr.defaultDate = new Date(c.wetDate);
    }
  }

  private loadFormToCard(): Card {
    const c: Card = (new Card()).copyConstructor(this.card);

    c.bedType = this.form.get('bedType').value;
    c.cropYear = this.form.get('cropYear').value;
    c.dacthalRate = this.form.get('dacthalRate').value;
    c.diaznonRate = this.form.get('diaznonRate').value;
    c.fieldID = this.form.get('fieldID').value;
    c.kerbRate = this.form.get('kerbRate').value;
    c.lorsbanRate = this.form.get('lorsbanRate').value;
    c.lotNumber = this.form.get('lotNumber').value;
    c.ranchManagerName = this.form.get('ranchManagerName').value;
    c.ranchName = this.form.get('ranchName').value;
    c.totalAcres = this.form.get('totalAcres').value;
    c.thinDate = (new Date(this.form.get('thinDate').value)).valueOf();
    c.hoeDate = (new Date(this.form.get('hoeDate').value)).valueOf();
    c.wetDate = (new Date(this.form.get('wetDate').value)).valueOf();
    c.harvestDate = (new Date(this.form.get('harvestDate').value)).valueOf();

    return c;
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
      newAlert.message = 'This will reopen a closed card, adding it back to the "entry" tab. Continue?';
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

  private toggleEditing(enable: boolean = this.form.disabled): void {
    if (enable) {
      this.form.enable();
      this.hoeDatePickr.allowInput = true;
      this.harvestDatePickr.allowInput = true;
      this.thinDatePickr.allowInput = true;
      this.wetDatePickr.allowInput = true;
    } else {
      this.form.disable();
      this.hoeDatePickr.allowInput = false;
      this.harvestDatePickr.allowInput = false;
      this.thinDatePickr.allowInput = false;
      this.wetDatePickr.allowInput = false;
    }
  }

  private isEditing(): boolean {
    return !this.form.disabled;
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
      this.route.params.subscribe(data => this.loadCardData(data.id));
      this.toggleEditing();
    });

    AlertService.newAlert(newAlert);
  }

  private saveChanges(): void {
    if (this.form.valid) {
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
        this.cardEdit.updateCard(this.loadFormToCard()).subscribe(data => {
            if (data.success) {
              this.route.params.subscribe(rData => this.loadCardData(rData.id));
              AlertService.newBasicAlert('Change saved successfully!', false);
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
    } else {
      AlertService.newBasicAlert('A valid crop year, ranch name, and commodity are required.', true);
    }
  }
}

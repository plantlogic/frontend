import {Component, OnInit, ViewChild} from '@angular/core';
import { AlertService } from './alert.service';
import {ModalDirective} from 'angular-bootstrap-md';
import {Alert} from './alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @ViewChild('alertModal') public alertModal: ModalDirective;
  public alertService = AlertService;
  public value: Alert;

  constructor() { }

  ngOnInit() {}

  isAlertShown(): boolean {
    if (this.alertService.getAlert()) {
      this.value = this.alertService.getAlert();
      if (!this.alertModal.isShown) {
        this.alertModal.config.backdrop = this.value.blockPageInteraction;
        this.alertModal.config.ignoreBackdropClick = true;
        this.alertModal.show();
      }
      return true;
    } else {
      this.value = undefined;
      if (this.alertModal.isShown) {
        this.alertModal.hide();
      }
      return false;
    }
  }

  isClickThroughAllowed(): boolean {
    if (this.value) {
      return !this.value.blockPageInteraction;
    } else {
      return false;
    }
  }

  emitAction(): void {
    if (this.value.subscribedAction$) {
      this.value.action$.emit();
    } else {
      AlertService.newBasicAlert('Error: There wasn\'t any action tied to that button.', true, 10);
    }
  }
}

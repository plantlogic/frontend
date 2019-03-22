import {Subscription} from 'rxjs';
import {EventEmitter} from '@angular/core';

export class Alert {
  title: string;
  message: string;
  color = 'primary';

  timeLeft: number;

  actionName: string;
  action$: EventEmitter<null>;
  subscribedAction$: Subscription;
  actionClosesAlert = false;
  actionClosesAlertWithoutOnClose = false;

  showClose = true;
  closeName = 'Close';
  onClose$: EventEmitter<null>;
  subscribedOnClose$: Subscription;

  blockPageInteraction = false;

  observeInterval$: Subscription;
}

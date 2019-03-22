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

  showClose = true;
  onClose$: EventEmitter<null>;
  subscribedOnClose$: Subscription;

  blockPageInteraction = false;

  observeInterval$: Subscription;
}

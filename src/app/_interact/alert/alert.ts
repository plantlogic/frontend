import {Observable, Subscription} from 'rxjs';

export class Alert {
  message: string;
  color = 'primary';
  timeLeft: number;
  title: string;
  actionName: string;
  action$: Observable<any>;
  showClose = true;
  blockPageInteraction = false;
  observeInterval$: Subscription;
}

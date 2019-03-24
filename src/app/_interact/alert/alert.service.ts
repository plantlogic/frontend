import {Injectable} from '@angular/core';
import {interval} from 'rxjs';
import {Alert} from './alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private static currentAlert: Alert;

  public static newAlert(newAlert: Alert) {
    if (this.currentAlert) {
      this.clearAlert();

      setTimeout(() => {
        this.currentAlert = newAlert;

        if (this.currentAlert.timeLeft !== undefined) {
          this.startTimeout();
        }
      }, 500);
    } else {
      this.currentAlert = newAlert;

      if (this.currentAlert.timeLeft !== undefined) {
        this.startTimeout();
      }
    }
  }

  public static newBasicAlert(message: string, isError: boolean, timeInSec: number = 5) {
    const newAlert = new Alert();
    newAlert.message = message;
    newAlert.color = isError ? 'danger' : 'success';
    newAlert.title = isError ? 'Error' : 'Success';
    newAlert.timeLeft = timeInSec;
    newAlert.showClose = true;
    newAlert.blockPageInteraction = false;

    this.newAlert(newAlert);
  }

  public static clearAlert() {
    if (this.currentAlert.observeInterval$) {
      this.currentAlert.observeInterval$.unsubscribe();
    }

    if (this.currentAlert.subscribedAction$) {
      this.currentAlert.subscribedAction$.unsubscribe();
    }

    if (this.currentAlert.subscribedOnClose$) {
      this.currentAlert.onClose$.emit();
      this.currentAlert.subscribedOnClose$.unsubscribe();
    }

    this.currentAlert = undefined;
  }


  public static clearAlertWithoutOnClose() {
    if (this.currentAlert.observeInterval$) {
      this.currentAlert.observeInterval$.unsubscribe();
    }

    if (this.currentAlert.subscribedAction$) {
      this.currentAlert.subscribedAction$.unsubscribe();
    }

    if (this.currentAlert.subscribedOnClose$) {
      this.currentAlert.subscribedOnClose$.unsubscribe();
    }

    this.currentAlert = undefined;
  }

  public static getAlert(): Alert {
    return this.currentAlert;
  }

  private static startTimeout(): void {
    this.currentAlert.observeInterval$ = interval(1000).subscribe(() => {
      if (this.currentAlert.timeLeft <= 1) {
        this.clearAlert();
      } else {
        this.currentAlert.timeLeft--;
      }
    });
  }
}

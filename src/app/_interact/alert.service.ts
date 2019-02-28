import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private static userMessage: string;
  private static userMessageIsError: boolean;
  private static mostRecent;

  public static newMessage(message: string, isError: boolean) {
    this.userMessage = message;
    this.userMessageIsError = isError;
    const current = Date.now();
    this.mostRecent = current;

    setTimeout(() => {
      if (current === this.mostRecent) {
        this.clearMessage();
      }
    }, 5000);
  }

  public static clearMessage(): void {
    this.userMessage = undefined;
    this.userMessageIsError = undefined;
    this.mostRecent = undefined;
  }

  public static getUserMessage(): string {
    return this.userMessage;
  }

  public static getIsError(): boolean {
    return this.userMessageIsError;
  }
}

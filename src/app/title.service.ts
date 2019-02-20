import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private siteTitle = environment.AppName;
  private pageTitle: string;

  public constructor(private angTitle: Title) {}

  public setTitle(newTitle: string): void {
    this.pageTitle = newTitle;
    this.angTitle.setTitle(this.pageTitle.concat(' | ', this.siteTitle));
  }

  public getTitle(): string {
    return this.angTitle.getTitle();
  }

  public getPageTitle(): string {
    return this.pageTitle;
  }

  public getSiteTitle(): string {
    return this.siteTitle;
  }
}

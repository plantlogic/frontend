import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private siteTitle = 'PlantLogic';

  public constructor(private angTitle: Title) {}

  public setTitle(newTitle: string): void {
    this.angTitle.setTitle(newTitle.concat(' | ', this.siteTitle));
  }

  public getTitle(): string {
    return this.angTitle.getTitle();
  }

  public getSiteTitle(): string {
    return this.siteTitle;
  }
}

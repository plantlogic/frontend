import { Component, OnInit } from '@angular/core';
import {Card} from '../../_dto/card/card';
import {AlertService} from '../../_interact/alert/alert.service';
import {TitleService} from '../../_interact/title.service';
import {CardViewService} from '../../_api/card-view.service';
import {MdbTableService} from 'angular-bootstrap-md';
import {Router} from '@angular/router';
import {NavService} from '../../_interact/nav.service';

@Component({
  selector: 'app-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss']
})
export class CardManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private cardService: CardViewService, private tableService: MdbTableService,
              private nav: NavService) { }

  cards: Card[];
  filter: string;
  previous: string;

  ngOnInit() {
    this.titleService.setTitle('Open Cards');
    this.loadCardData();
  }



  private loadCardData() {
    this.cardService.getAllCards().subscribe(
      data => {
        if (data.success) {
          this.cards = data.data;
          this.tableService.setDataSource(this.cards);
          this.cards = this.tableService.getDataSource();
          this.previous = this.tableService.getDataSource();
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  public filterItems() {
    const prev = this.tableService.getDataSource();

    if (!this.filter) {
      this.tableService.setDataSource(this.previous);
      this.cards = this.tableService.getDataSource();
    }

    if (this.filter) {
      this.filter.toLowerCase();
      this.cards = this.tableService.searchLocalDataBy(this.filter.toLowerCase());
      this.tableService.setDataSource(prev);
    }
  }

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }
}

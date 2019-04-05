import { Component, OnInit } from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardEntryService} from '../../../_api/card-entry.service';
import {MdbTableService} from 'angular-bootstrap-md';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-open-card-entry',
  templateUrl: './open-card-entry.component.html',
  styleUrls: ['./open-card-entry.component.scss']
})
export class OpenCardEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private cardService: CardEntryService, private tableService: MdbTableService,
              private nav: NavService, private route: ActivatedRoute) { }

  card: Card;

  ngOnInit() {
    this.titleService.setTitle('View Card');
    this.route.params.subscribe(data => this.loadCardData(data.id));
  }

  private loadCardData(id: string) {
    this.cardService.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = data.data;
          // this.tableService.setDataSource(this.card);
          // this.card = this.tableService.getDataSource();
          // this.previous = this.tableService.getDataSource();
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

}

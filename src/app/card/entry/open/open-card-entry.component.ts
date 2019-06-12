import {Component, OnInit, ViewChildren} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardEntryService} from '../../../_api/card-entry.service';
import {CollapseComponent} from 'angular-bootstrap-md';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import {FlatpickrOptions} from 'ng2-flatpickr';

@Component({
  selector: 'app-open-card-entry',
  templateUrl: './open-card-entry.component.html',
  styleUrls: ['./open-card-entry.component.scss']
})
export class OpenCardEntryComponent implements OnInit {
  @ViewChildren(CollapseComponent) collapses: CollapseComponent[];

  constructor(private titleService: TitleService, private cardService: CardEntryService,
              private nav: NavService, private route: ActivatedRoute) { }

  card: Card;

  datePickr: FlatpickrOptions = {
    dateFormat: 'm-d-Y'
  };
  wetDateSet: boolean;
  thinDateSet: boolean;
  hoeDateSet: boolean;

  ngOnInit() {
    this.titleService.setTitle('View Card');
    this.route.params.subscribe(data => this.loadCardData(data.id));
  }

  private loadCardData(id: string) {
    this.cardService.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = (new Card()).copyConstructor(data.data);
          this.card.initCommodityString();
          this.card.initTotalAcres();

          this.wetDateSet = (this.card.wetDate && true);
          this.thinDateSet = (this.card.thinDate && true);
          this.hoeDateSet = (this.card.hoeDate && true);
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

  private saveDates(): void {
    if (this.card.wetDate) {
      this.card.wetDate = (new Date(this.card.wetDate)).valueOf();
    }
    if (this.card.thinDate) {
      this.card.thinDate = (new Date(this.card.thinDate)).valueOf();
    }
    if (this.card.hoeDate) {
      this.card.hoeDate = (new Date(this.card.hoeDate)).valueOf();
    }

    this.cardService.addWetThinHoeData(this.card.id, this.card).subscribe();
  }
}

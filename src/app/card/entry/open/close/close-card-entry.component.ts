import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../../../_interact/alert/alert.service';
import {Card} from '../../../../_dto/card/card';
import {TitleService} from '../../../../_interact/title.service';
import {CardEntryService} from '../../../../_api/card-entry.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-close-card',
  templateUrl: './close-card-entry.component.html',
  styleUrls: ['./close-card-entry.component.scss']
})
export class CloseCardEntryComponent implements OnInit {
  submitAttempted = false;
  harvestDate;

  constructor(private titleService: TitleService, private cardService: CardEntryService, private router: Router,
              private route: ActivatedRoute) {}

  card: Card = new Card();

  ngOnInit() {
    this.titleService.setTitle('Close Card');
    this.route.params.subscribe(data => this.card.id = data.id);
  }

  private closeCard() {
    this.submitAttempted = false;
    if (!this.harvestDate) {
      AlertService.newBasicAlert('No Harvest Date Provided', true);
      return;
    }
    this.card.harvestDate = (new Date(this.harvestDate)).valueOf();
    this.cardService.closeCard(this.card).subscribe(
      data => {
        if (data.success) {
          AlertService.newBasicAlert('Card set as harvested!', false);
          this.router.navigateByUrl('/entry');
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }
}

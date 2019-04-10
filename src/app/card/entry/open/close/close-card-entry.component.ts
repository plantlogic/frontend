import { Component, OnInit } from '@angular/core';
import {AlertService} from '../../../../_interact/alert/alert.service';
import {Card} from '../../../../_dto/card/card';
import {TitleService} from '../../../../_interact/title.service';
import {CardEntryService} from '../../../../_api/card-entry.service';
import {NavService} from '../../../../_interact/nav.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FlatpickrOptions} from 'ng2-flatpickr';

@Component({
  selector: 'app-close-card',
  templateUrl: './close-card-entry.component.html',
  styleUrls: ['./close-card-entry.component.scss']
})
export class CloseCardEntryComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  flatpickrOptions: FlatpickrOptions = {
    dateFormat: 'm-d-Y',
    defaultDate: new Date(Date.now())
  };

  constructor(private titleService: TitleService, private cardService: CardEntryService, private router: Router,
              private nav: NavService, private route: ActivatedRoute, private fb: FormBuilder) {
    this.form = this.fb.group({
      harvestDate: [Date.now(), Validators.required]
    });
  }

  card: Card = new Card();

  ngOnInit() {
    this.titleService.setTitle('Close Card');
    this.route.params.subscribe(data => this.card.id = data.id);
  }

  private closeCard() {
    if (this.form.valid) {
      this.submitAttempted = false;
      this.card.harvestDate = this.form.get('harvestDate').value;
      this.cardService.closeCard(this.card).subscribe(
        data => {
          if (data.success) {
            this.card = data.data;
            this.router.navigateByUrl('/entry');
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        }
      );
    } else {
      this.submitAttempted = true;
    }
  }

}

import {TractorEntry} from './../../../../_dto/card/tractor-entry';
import {Component, OnInit} from '@angular/core';
import {TitleService} from 'src/app/_interact/title.service';
import {ActivatedRoute} from '@angular/router';
import {CardEntryService} from 'src/app/_api/card-entry.service';
import {AlertService} from 'src/app/_interact/alert/alert.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {NavService} from '../../../../_interact/nav.service';
import {Chemical} from 'src/app/_dto/card/chemical';
import {CommonFormDataService} from '../../../../_api/common-form-data.service';

@Component({
  selector: 'app-add-tractor',
  templateUrl: './add-tractor-entry.component.html',
  styleUrls: ['./add-tractor-entry.component.scss']
})
export class AddTractorEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private nav: NavService,
              private route: ActivatedRoute, private cardEntryService: CardEntryService,
              public common: CommonFormDataService) { }

  tractor: TractorEntry = new TractorEntry();
  submitAttempted = false;
  rateUnits: Array<string>;
  cardId: string;


  ngOnInit() {
    this.titleService.setTitle('Tractor');
    this.rateUnits = this.initRateUnits();
    this.route.params.subscribe(data => this.cardId = data.id);
  }

  submit() {
    this.submitAttempted = false;
    this.tractor.workDate = (new Date(this.tractor.workDate)).valueOf();
    this.cardEntryService.addTractorData(this.cardId, this.tractor).subscribe(
      data => {
        if (data.success) {
          AlertService.newBasicAlert('Saved successfully!', false);
          this.nav.goBack();
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  initRateUnits(): Array<string> {
    return this.common.getValues('chemicalRateUnits');
  }

  datePickr(): FlatpickrOptions {
    return {
      dateFormat: 'm-d-Y',
      defaultDate: new Date()
    };
  }

  newChemical(): Chemical {
    return new Chemical();
  }
}

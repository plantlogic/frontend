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
  cardId: string;


  ngOnInit() {
    this.titleService.setTitle('Tractor');
    this.route.params.subscribe(data => this.cardId = data.id);
  }

  submit() {
    this.submitAttempted = false;
    if ((this.tractor.operator) && (!this.initTractorOperators().includes(this.tractor.operator))) {
      AlertService.newBasicAlert('Invalid tractor operator selected, please select one from the list provided', true);
      return;
    }
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
    try {
      return this.common.getValues('chemicalRateUnits').sort();
    } catch { console.log('Error when initializing rate units'); }
  }


  initTractorWork(): Array<string> {
    try {
      return this.common.getValues('tractorWork').sort();
    } catch { console.log('Error when initializing tractor work types'); }
  }

  initTractorOperators(): Array<string> {
    try {
      return this.common.getValues('tractorOperators').sort();
    } catch { console.log('Error when initializing tractor operators'); }
  }

  initChemicals(): Array<string> {
    try {
      return this.common.getValues('chemicals');
    } catch { console.log('Error when initializing chemicals'); }
  }

  initFertilizers(): Array<string> {
    try {
      return this.common.getValues('fertilizers');
    } catch { console.log('Error when initializing fertilizers'); }
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

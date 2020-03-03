import {IrrigationEntry} from './../../../../_dto/card/irrigation-entry';
import {Component, OnInit} from '@angular/core';
import {TitleService} from 'src/app/_interact/title.service';
import {CardEntryService} from 'src/app/_api/card-entry.service';
import {AlertService} from 'src/app/_interact/alert/alert.service';
import {ActivatedRoute} from '@angular/router';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {NavService} from '../../../../_interact/nav.service';
import {Chemical} from 'src/app/_dto/card/chemical';
import {CommonFormDataService} from '../../../../_api/common-form-data.service';


@Component({
  selector: 'app-add-irrigation',
  templateUrl: './add-irrigation-entry.component.html',
  styleUrls: ['./add-irrigation-entry.component.scss']
})
export class AddIrrigationEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private nav: NavService,
              private route: ActivatedRoute, private cardEntryService: CardEntryService,
              public common: CommonFormDataService) { }

  irrigation: IrrigationEntry = new IrrigationEntry();
  submitAttempted = false;
  cardId: string;


  ngOnInit() {
    this.titleService.setTitle('Irrigation');
    this.route.params.subscribe(data => this.cardId = data.id);
  }

  submit() {
    this.submitAttempted = false;
    if ((this.irrigation.irrigator) && (!this.initIrrigators().includes(this.irrigation.irrigator))) {
      AlertService.newBasicAlert('Invalid Irrigator selected, please select one from the list provided', true);
      return;
    }
    this.irrigation.workDate = (new Date(this.irrigation.workDate)).valueOf();
    this.cardEntryService.addIrrigationData(this.cardId, this.irrigation).subscribe(
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

  initIrrigationMethods(): Array<string> {
    try {
      return this.common.getValues('irrigationMethod').sort();
    } catch { console.log('Error when initializing irrigation methods'); }
  }

  initIrrigators(): Array<string> {
    try {
      return this.common.getValues('irrigators').sort();
    } catch { console.log('Error when initializing irrigators'); }
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

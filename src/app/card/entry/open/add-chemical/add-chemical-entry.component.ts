import {Component, OnInit} from '@angular/core';
import {AlertService} from '../../../../_interact/alert/alert.service';
import {TitleService} from '../../../../_interact/title.service';
import {FormBuilder} from '@angular/forms';
import {CardEntryService} from '../../../../_api/card-entry.service';
import {AuthService} from '../../../../_auth/auth.service';
import {NavService} from '../../../../_interact/nav.service';
import {Chemicals} from '../../../../_dto/card/chemicals';
import {Chemical} from '../../../../_dto/card/chemical';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {ActivatedRoute} from '@angular/router';
import {CommonFormDataService} from '../../../../_api/common-form-data.service';

@Component({
  selector: 'app-add-chemical',
  templateUrl: './add-chemical-entry.component.html',
  styleUrls: ['./add-chemical-entry.component.scss']
})
export class AddChemicalEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder, private route: ActivatedRoute,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService,
              public common: CommonFormDataService) { }

  chem: Chemicals = new Chemicals(); // has date, chemical, and fertilizer
  submitAttempted = false;
  cardId: string;

  ngOnInit() {
    this.titleService.setTitle('Applied');
    this.route.params.subscribe(data => this.cardId = data.id);
  }


  submit() {
    this.submitAttempted = false;
    this.chem.date = (new Date(this.chem.date)).valueOf();
    this.cardEntryService.addChemicalData(this.cardId, this.chem).subscribe(
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

  initChemicals(): Array<string> {
    try {
      return this.common.getValues('chemicals').sort();
    } catch { console.log('Error when initializing chemicals'); }
  }

  initFertilizers(): Array<string> {
    try {
      return this.common.getValues('fertilizers').sort();
    } catch { console.log('Error when initializing fertilizers'); }
  }

  initRateUnits(): Array<string> {
    try {
      return this.common.getValues('chemicalRateUnits').sort();
    } catch { console.log('Error when initializing rate units'); }
  }

  datePickr(workDate: number): FlatpickrOptions {
    return {
      dateFormat: 'm-d-Y',
      defaultDate: new Date()
    };
  }

  newChemical(): Chemical {
    return new Chemical();  // has name, rate, unit
  }
}

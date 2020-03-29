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
import { CommonLookup } from 'src/app/_api/common-data.service';

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
  cardId: string;

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['chemicals', 'chemicalRateUnits', 'fertilizers'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Applied');
    this.initCommon(c => {
      this.commonKeys.forEach(key => tempThis[key] = c[key] );
      this.route.params.subscribe(data => this.cardId = data.id);
    });
  }

  datePickr(workDate: number): FlatpickrOptions {
    return {
      dateFormat: 'm-d-Y',
      defaultDate: new Date()
    };
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key)) {
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
        sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
      });
      f(sortedCommon);
    });
  }

  newChemical(): Chemical {
    return new Chemical();  // has name, rate, unit
  }

  submit() {
    const c = this.chem;

    // Check Chemical / Fertilizer Info
    c.date = (new Date(c.date)).valueOf();
    if (c.chemical) {
      if (!c.chemical.name || !this[`chemicals`].find(c2 => c2.id === c.chemical.name)) {
        AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
        return;
      }
      if (!c.chemical.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.chemical.unit)) {
        AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
        return;
      }
    }
    if (c.fertilizer) {
      if (!c.fertilizer.name || !this[`fertilizers`].find(c2 => c2.id === c.fertilizer.name)) {
        AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
        return;
      }
      if (!c.fertilizer.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.fertilizer.unit)) {
        AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
        return;
      }
    }
    if (!c.chemical && !c.fertilizer) {
      AlertService.newBasicAlert('No Chemical or Fertilizer Entered - please fix and try again.', true);
      return;
    }

    this.cardEntryService.addChemicalData(this.cardId, c).subscribe(
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
}

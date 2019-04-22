import { Component, OnInit } from '@angular/core';
import {AlertService} from '../../../../_interact/alert/alert.service';
import {TitleService} from '../../../../_interact/title.service';
import {FormBuilder} from '@angular/forms';
import {CardEntryService} from '../../../../_api/card-entry.service';
import {AuthService} from '../../../../_auth/auth.service';
import {NavService} from '../../../../_interact/nav.service';
import {Chemicals} from '../../../../_dto/card/chemicals';
import {Chemical, ChemicalUnit} from '../../../../_dto/card/chemical';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-chemical',
  templateUrl: './add-chemical-entry.component.html',
  styleUrls: ['./add-chemical-entry.component.scss']
})
export class AddChemicalEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder, private route: ActivatedRoute,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService) { }

  chem: Chemicals = new Chemicals();
  submitAttempted = false;
  rateUnits: Array<string>;
  cardId: string;

  ngOnInit() {
    this.titleService.setTitle('Create Card');
    this.rateUnits = this.initRateUnits();
    this.route.params.subscribe(data => this.cardId = data.id);
  }


  submit() {
    /* if (false) {
      this.submitAttempted = true;
    } else { */
      this.submitAttempted = false;

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
    // }
  }

  initRateUnits(): Array<string> {
    const keys = Object.keys(ChemicalUnit);
    return keys.slice(keys.length / 2);
  }

  datePickr(workDate: number): FlatpickrOptions {
    return {
      dateFormat: 'm-d-Y',
      defaultDate: new Date()
    };
  }

  newChemical(): Chemical {
    return new Chemical();
  }
}

import {CardEntryService} from './../../../_api/card-entry.service';
import {FormBuilder, NgModel} from '@angular/forms';
import {TitleService} from '../../../_interact/title.service';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {Card} from '../../../_dto/card/card';
import {AuthService} from 'src/app/_auth/auth.service';
import {NavService} from '../../../_interact/nav.service';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {Chemical} from '../../../_dto/card/chemical';
import {CommonFormDataService} from '../../../_api/common-form-data.service';
// import { componentNeedsResolution } from '@angular/core/src/metadata/resource_loading';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService,
              public common: CommonFormDataService) { }

  @ViewChild('ranchName', { static: true }) public ranchName: NgModel;
  @ViewChild('cropYear', { static: true }) public cropYear: NgModel;

  card: Card = new Card();
  submitAttempted = false;

  ngOnInit() {
    this.titleService.setTitle('Create Card');
    this.card.ranchManagerName = this.auth.getName();
    this.card.lotNumber = '';
  }

  submit() {
    if (this.ranchName.invalid || this.cropYear.invalid ||
      this.card.commodityArray.some(c => c.commodity === undefined || c.commodity === '')) {
      this.submitAttempted = true;
      AlertService.newBasicAlert('There are some invalid fields - please fix and try again.', true);
    } else {
      this.submitAttempted = false;

      // Replace all whitespace found in lot number
      this.card.lotNumber = this.card.lotNumber.replace(/\s/g, '');

      this.card.preChemicalArray.forEach(v => v.date = (new Date(v.date)).valueOf());
      this.cardEntryService.createCard(this.card).subscribe(
        data => {
          console.log(data);
          if (data.success) {
            AlertService.newBasicAlert('Card saved successfully!', false);
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


  private addCommodities(): void {
    this.card.commodityArray.push(new Commodities());
  }

  private addPreChemicals(): void {
    this.card.preChemicalArray.push(new Chemicals());
  }

  private datePickr(workDate: number): FlatpickrOptions {
    return {
      enableTime: true,
      dateFormat: 'm-d-Y H:i',
      defaultDate: new Date()
    };
  }

  private newChemical(): Chemical {
    return new Chemical();
  }

  initRateUnits(): Array<string> {
    return this.common.getValues('chemicalRateUnits');
  }

  getRanches(): Array<string> {
    try {
      return this.common.getValues('ranches').filter(r => this.auth.getRanchAccess().includes(r));
    } catch (E) { }
  }
}

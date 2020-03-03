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
import { componentNeedsResolution } from '@angular/core/src/metadata/resource_loading';
import { TractorEntry } from 'src/app/_dto/card/tractor-entry';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService,
              public common: CommonFormDataService) { }

  @ViewChild('ranchName') public ranchName: NgModel;
  @ViewChild('cropYear') public cropYear: NgModel;

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
      this.card.tractorArray.forEach(v => v.workDate = (new Date(v.workDate)).valueOf());
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

  private addTractor(): void {
    if (this.card.tractorArray.length < 1) {
      const t = new TractorEntry();
      t.workDone = 'Initial Setup';
      this.card.tractorArray.push(t);
    }
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
    try {
      return this.common.getValues('chemicalRateUnits').sort();
    } catch { console.log('Error when initializing rate units'); }
  }

  initCommodities(): Array<string> {
    try {
      return this.common.getMapKeys('commodities').sort();
    } catch { console.log('Error when initializing commodities'); }
  }

  initCommodityValues(p): Array<string> {
    try {
      return this.common.getMapValues('commodities', p.commodity).sort();
    } catch { console.log('Error when initializing commodity values for ' + p); }
  }

  initBedTypes(): Array<string> {
    try {
      return this.common.getValues('bedTypes').sort();
    } catch { console.log('Error when initializing bed types'); }
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

  initTractorOperators(): Array<string> {
    try {
      return this.common.getValues('tractorOperators').sort();
    } catch { console.log('Error when initializing tractor operators'); }
  }

  fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }

  getRanches(): Array<string> {
    try {
      return this.common.getValues('ranches').filter(r => this.auth.getRanchAccess().includes(r)).sort();
    } catch (E) { }
  }
}

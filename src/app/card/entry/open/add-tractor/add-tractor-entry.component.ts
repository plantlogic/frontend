import {TractorEntry} from './../../../../_dto/card/tractor-entry';
import {Component, OnInit} from '@angular/core';
import {TitleService} from 'src/app/_interact/title.service';
import {ActivatedRoute} from '@angular/router';
import {CardEntryService} from 'src/app/_api/card-entry.service';
import {AlertService} from 'src/app/_interact/alert/alert.service';
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

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['chemicals', 'chemicalRateUnits', 'fertilizers', 'tractorOperators', 'tractorWork'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Tractor');
    this.initCommon((c) => {
      this.commonKeys.forEach((key) => tempThis[`${key}`] = c[`${key}`] );
      this.route.params.subscribe((data) => this.cardId = data.id);
    });
  }

  private addTractorChemical(): void {
    if (!this.tractor.chemicalsFull()) {
      this.tractor.chemicalArray.push(new Chemical());
    }
  }

  private addTractorFertilizer(): void {
    if (!this.tractor.fertilizersFull()) {
      this.tractor.fertilizerArray.push(new Chemical());
    }
  }

  public dataListOptionValueToID(optionValue, dataListID) {
    const option = document.querySelector('#' + dataListID + ' [value="' + optionValue + '"]') as HTMLElement;
    return (option) ? option.id : null;
  }

  fixDate(d): number {
    if (!d) { return null; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day).valueOf();
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key)) {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      // console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    this.common.getAllValues((data) => {
      this.commonKeys.forEach((key) => {
        sortedCommon[`${key}`] = tempThis.common.sortCommonArray(data[`${key}`], key);
      });
      f(sortedCommon);
    });
  }

  newChemical(): Chemical {
    return new Chemical();
  }

  submit() {
    // Check Tractor Info
    const t = Object.assign(new TractorEntry(), this.tractor);
    t.workDate = (new Date(t.workDate)).valueOf();
    const operatorID = this.dataListOptionValueToID(t.operator, 'tractorOperators');
    if (!operatorID || !this[`tractorOperators`].find((e) => e.id === operatorID)) {
      AlertService.newBasicAlert('Invalid Tractor Operator - please fix and try again.', true);
      return;
    }
    t.operator = operatorID;
    // Check Tractor Work
    if (!t.workDone || !this[`tractorWork`].find((tw) => tw.id === t.workDone)) {
      AlertService.newBasicAlert('Invalid Tractor Work Entered - please fix and try again.', true);
      return;
    }
    // Check Chemical
    if (t.chemicalArray) {
      for (const c of t.chemicalArray) {
        if (!c.name || !this[`chemicals`].find((c2) => c2.id === c.name)) {
          AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
          return;
        }
        if (!c.rate) {
          AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
          return;
        }
        if (!c.unit || !this[`chemicalRateUnits`].find((c2) => c2.id === c.unit)) {
          AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
          return;
        }
      }
    }
    // Check Fertilizer Info
    if (t.fertilizerArray) {
      for (const f of t.fertilizerArray) {
        if (!f.name || !this[`fertilizers`].find((c2) => c2.id === f.name)) {
          AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
          return;
        }
        if (!f.rate) {
          AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
          return;
        }
        if (!f.unit || !this[`chemicalRateUnits`].find((c2) => c2.id === f.unit)) {
          AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
          return;
        }
      }
    }

    this.cardEntryService.addTractorData(this.cardId, t).subscribe(
      (data) => {
        if (data.success) {
          AlertService.newBasicAlert('Saved successfully!', false);
          this.nav.goBack();
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }
}

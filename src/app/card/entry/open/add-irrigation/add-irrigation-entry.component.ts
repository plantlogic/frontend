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
  cardId: string;

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['chemicals', 'chemicalRateUnits', 'fertilizers', 'irrigationMethod', 'irrigators'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Irrigation');
    this.initCommon(c => {
      this.commonKeys.forEach(key => tempThis[key] = c[key] );
      this.route.params.subscribe(data => this.cardId = data.id);
    });
  }

  public dataListOptionValueToID(optionValue, dataListID) {
    const option = document.querySelector('#' + dataListID + ' [value="' + optionValue + '"]') as HTMLElement;
    return (option) ? option.id : null;
  }

  datePickr(): FlatpickrOptions {
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
    return new Chemical();
  }

  submit() {
    // Check Irrigation Info
    const c = this.irrigation;
    c.workDate = (new Date(c.workDate)).valueOf();
    if (c.chemical) {
      if (!c.chemical.name || !this[`chemicals`].find(c2 => c2.id === c.chemical.name)) {
        AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
        return;
      }
      if (!c.chemical.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.chemical.unit)) {
        AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
        return;
      }
      if (!c.irrigator) {
        AlertService.newBasicAlert('Irrigator is required when adding chemicals - please fix and try again.', true);
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
    if (c.irrigator) {
      const irrigatorID = this.dataListOptionValueToID(c.irrigator, 'irrigators');
      if (!irrigatorID || !this[`irrigators`].find(e => e.id === irrigatorID)) {
        AlertService.newBasicAlert('Invalid Irrigator - please fix and try again.', true);
        return;
      }
      c.irrigator = irrigatorID;
    }
    if (!c.method || !this[`irrigationMethod`].find(c2 => c2.id === c.method)) {
      AlertService.newBasicAlert('Invalid Irrigation Method - please fix and try again.', true);
      return;
    }

    this.cardEntryService.addIrrigationData(this.cardId, c).subscribe(
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

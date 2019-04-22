import { CardEntryService } from './../../../_api/card-entry.service';
import {FormGroup, FormBuilder, Validators, FormControl, NgModel} from '@angular/forms';
import { TitleService } from '../../../_interact/title.service';
import { AlertService } from '../../../_interact/alert/alert.service';
import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {Alert} from '../../../_interact/alert/alert';
import { Card } from '../../../_dto/card/card';
import { AuthService } from 'src/app/_auth/auth.service';
import {NavService} from '../../../_interact/nav.service';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {Chemical, ChemicalUnit} from '../../../_dto/card/chemical';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private auth: AuthService, private nav: NavService) { }

  @ViewChild('ranchName') public ranchName: NgModel;
  @ViewChild('cropYear') public cropYear: NgModel;
  card: Card = new Card();
  submitAttempted = false;
  rateUnits: Array<string>;

  ngOnInit() {
    this.titleService.setTitle('Create Card');
    this.card.ranchManagerName = this.auth.getName();
    this.rateUnits = this.initRateUnits();
  }

  submit() {
    if (this.ranchName.invalid || this.cropYear.invalid) {
      this.submitAttempted = true;
      AlertService.newBasicAlert('There are some invalid fields - please fix and try again.', true);
    } else {
      this.submitAttempted = false;
      this.cardEntryService.createCard(this.card).subscribe(
        data => {
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
      dateFormat: 'm-d-Y',
      defaultDate: new Date()
    };
  }

  private newChemical(): Chemical {
    return new Chemical();
  }

  initRateUnits(): Array<string> {
    const keys = Object.keys(ChemicalUnit);
    return keys.slice(keys.length / 2);
  }
}

import { IrrigationEntry } from './../../../../_dto/card/irrigation-entry';
import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/_interact/title.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CardEntryService } from 'src/app/_api/card-entry.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import { ActivatedRoute } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { NavService } from '../../../../_interact/nav.service';
import { Chemical, ChemicalUnit } from 'src/app/_dto/card/chemical';

@Component({
  selector: 'app-add-irrigation',
  templateUrl: './add-irrigation-entry.component.html',
  styleUrls: ['./add-irrigation-entry.component.scss']
})
export class AddIrrigationEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private nav: NavService,
              private route: ActivatedRoute) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  irrigationEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['Lorsban', 'Diaznon', 'Kerb', 'Dacthal'];
  chemical: Array<any> = ['chem1', 'chem2'];
  irrigationEntry: IrrigationEntry = new IrrigationEntry();
  chemEntry: Chemical = new Chemical();
  ferEntry: Chemical = new Chemical();
  cardId: string;
  rateUnits: Array<string>;

  ngOnInit() {
    this.titleService.setTitle('Irrigation');
    this.rateUnits = this.initRateUnits();
    this.irrigationEntryForm = this.fb.group({      workDate: [Date.now(), [ Validators.required] ],
      method: ['', [ Validators.required, Validators.minLength(1)]],
      fertilizerName: ['', []],
      fertilizerRate: ['', [Validators.min(0), Validators.max(1000)]],
      fertilizerUnit: ['', []],
      chemicalName: ['', []],
      chemicalRate: ['', [Validators.min(0), Validators.max(1000)]],
      chemicalUnit: ['', []]
    });
    this.route.params.subscribe(data => this.cardId = data.id);
    this.irrigationEntryForm.valueChanges.subscribe(console.log);
    console.log(this.cardId);
  }

  submit() {
    if ( this.irrigationEntryForm.get('workDate').invalid ||
    this.irrigationEntryForm.get('method').invalid ||
    this.irrigationEntryForm.get('fertilizerName').invalid ||
    this.irrigationEntryForm.get('fertilizerRate').invalid ||
    this.irrigationEntryForm.get('fertilizerUnit').invalid ||
    this.irrigationEntryForm.get('chemicalName').invalid ||
    this.irrigationEntryForm.get('chemicalRate').invalid ||
    this.irrigationEntryForm.get('chemicalUnit').invalid) {
    this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      console.log('success');
      this.irrigationEntry.workDate = (new Date(this.irrigationEntryForm.get('workDate').value)).valueOf();
      this.irrigationEntry.method = this.irrigationEntryForm.get('method').value;


      this.chemEntry.name = this.irrigationEntryForm.get('chemicalName').value;
      this.chemEntry.rate = this.irrigationEntryForm.get('chemicalRate').value;
      this.chemEntry.unit = this.irrigationEntryForm.get('chemicalUnit').value;

      this.ferEntry.name = this.irrigationEntryForm.get('fertilizerName').value;
      this.ferEntry.rate = this.irrigationEntryForm.get('fertilizerRate').value;
      this.ferEntry.unit = this.irrigationEntryForm.get('fertilizerUnit').value;

      this.irrigationEntry.chemical = this.chemEntry;
      this.irrigationEntry.fertilizer = this.ferEntry;


      this.cardEntryService.addIrrigationData(this.cardId, this.irrigationEntry).subscribe(
        data => {
          if (data.success) {
            this.irrigationEntry = data.data;
            this.nav.goBack();
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again', true);
        }
      );
    }
  }

  initRateUnits(): Array<string> {
    const keys = Object.keys(ChemicalUnit);
    return keys.slice(keys.length / 2);
  }
}

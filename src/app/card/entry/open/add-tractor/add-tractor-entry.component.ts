import { TractorEntry } from './../../../../_dto/card/tractor-entry';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from 'src/app/_interact/title.service';
import { ActivatedRoute } from '@angular/router';
import { CardEntryService } from 'src/app/_api/card-entry.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {NavService} from '../../../../_interact/nav.service';
import { Chemical, ChemicalUnit } from 'src/app/_dto/card/chemical';

@Component({
  selector: 'app-add-tractor',
  templateUrl: './add-tractor-entry.component.html',
  styleUrls: ['./add-tractor-entry.component.scss']
})
export class AddTractorEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder, private nav: NavService,
              private route: ActivatedRoute, private cardEntryService: CardEntryService) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  tractorEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['Lorsban', 'Diaznon', 'Kerb', 'Dacthal'];
  chemical: Array<any> = ['chem1', 'chem2'];
  tractorEntery: TractorEntry = new TractorEntry();
  chemEntry: Chemical = new Chemical();
  ferEntry: Chemical = new Chemical();
  cardId: string;
  rateUnits: Array<string>;

  ngOnInit() {
    this.titleService.setTitle('Tractor');
    this.rateUnits = this.initRateUnits();
    this.tractorEntryForm = this.fb.group({
      workDate: [Date.now(), [ Validators.required] ],
      workDone: ['', [ Validators.required, Validators.minLength(1)]],
      operator: ['', [ Validators.required, Validators.minLength(1)]],
      fertilizerName: ['', []],
      fertilizerRate: ['', []],
      fertilizerUnit: ['', []],
      chemicalName: ['', []],
      chemicalRate: ['', []],
      chemicalUnit: ['', []]
      });
    this.route.params.subscribe(data => this.cardId = data.id);
    this.tractorEntryForm.valueChanges.subscribe(console.log);
    console.log(this.cardId);
  }

  submit() {
    if ( this.tractorEntryForm.get('workDate').invalid ||
        this.tractorEntryForm.get('workDone').invalid ||
        this.tractorEntryForm.get('operator').invalid ||
        this.tractorEntryForm.get('fertilizerName').invalid ||
        this.tractorEntryForm.get('fertilizerRate').invalid ||
        this.tractorEntryForm.get('fertilizerUnit').invalid ||
        this.tractorEntryForm.get('chemicalName').invalid ||
        this.tractorEntryForm.get('chemicalRate').invalid ||
        this.tractorEntryForm.get('chemicalUnit').invalid) {
        this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      console.log('success');
      this.tractorEntery.workDate = (new Date(this.tractorEntryForm.get('workDate').value)).valueOf();
      this.tractorEntery.workDone = this.tractorEntryForm.get('workDone').value;
      this.tractorEntery.operator = this.tractorEntryForm.get('operator').value;

      this.chemEntry.name = this.tractorEntryForm.get('chemicalName').value;
      this.chemEntry.rate = this.tractorEntryForm.get('chemicalRate').value;
      this.chemEntry.unit = this.tractorEntryForm.get('chemicalUnit').value;

      this.ferEntry.name = this.tractorEntryForm.get('fertilizerName').value;
      this.ferEntry.rate = this.tractorEntryForm.get('fertilizerRate').value;
      this.ferEntry.unit = this.tractorEntryForm.get('fertilizerUnit').value;

      this.tractorEntery.chemical = this.chemEntry;
      this.tractorEntery.fertilizer = this.ferEntry;

      this.cardEntryService.addTractorData(this.cardId, this.tractorEntery).subscribe(
        data => {
          if (data.success) {
            this.tractorEntery = data.data;
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

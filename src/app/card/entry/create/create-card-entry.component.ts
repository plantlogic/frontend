import { Card } from '../../../card';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TitleService } from '../../../_interact/title.service';
import { AlertService } from '../../../_interact/alert/alert.service';
import { Component, OnInit, EventEmitter } from '@angular/core';
import {Alert} from '../../../_interact/alert/alert';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder) {

  }
  form: FormGroup;
  submitAttempted = false;
  ranchList: Array<any> = [ 'Ranch1', 'Ranch2'];
  cropYear: Array<any> = ['2018', '2019', '2020'];
  commodityList: Array<any> = [ { commodity: 'Select' },
  { commodity: 'Lettuce', variety: ['Select', 'Lettuce v1', 'Lettuce v2'] },
  { commodity: 'Strawberry', variety: ['Select', 'Strawberry v1', 'Strawberry v2'] },
  { commodity: 'Broccoli', variety: ['Select', 'Broccoli v1', ' Broccoli v2', 'Broccoli v3'] },
  { commodity: 'Tomato', variety: ['Select', 'Tomato v1', 'Tomato v2', 'Tomato v3'] },
  ];

  variety: Array<any>;
  prepMaterial: Array<any> = ['material 1', 'material 2', 'material 3'];

  changeCommodity(count) {
    this.variety = this.commodityList.find(con => con.commodity === count).variety;
  }

  ngOnInit() {
    this.titleService.setTitle('Create Card');
    this.form = this.fb.group({
      ranch: ['', [Validators.required]],
      lotNumber: ['', [ Validators.min(0)]],
      acreSize: ['', [ Validators.required, Validators.min(1), Validators.max(500)]],
      cropYear: ['', [ Validators.min(2018)]],
      cropNumber: ['', [ Validators.min(0)]],
      commodity: ['', [Validators.required, Validators.min(1)]],
      variety: ['', [Validators.required]],
      seedLotNumber: ['', [ Validators.min(1)]],
      bedType: ['', [ Validators.min(0), Validators.max(80)]],
      prepMaterial: ['', [ Validators.min(1)]]
    });
    this.form.valueChanges.subscribe(console.log);
  }

  submit() {
    if ( this.form.get('ranch').invalid ||
        this.form.get('lotNumber').invalid ||
        this.form.get('cropYear').invalid ||
        this.form.get('cropNumber').invalid ||
        this.form.get('commodity').invalid ||
        this.form.get('seedLotNumber').invalid ||
        this.form.get('bedType').invalid ||
        this.form.get('prepMaterial').invalid) {
        this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      console.log('success');
    }
  }

}

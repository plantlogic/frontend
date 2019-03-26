import { Card } from '../../../card';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TitleService } from '../../../_interact/title.service';
import { AlertService } from '../../../_interact/alert/alert.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  // cardModel = new Card('1', 20, 5, 2019, 3, 'Lettuce', 'Iceberg', 100, 4, 40, '');
  cardModel = Card;

  commodityList: Array<any> = [ { commodity: 'Select'},
  { commodity: 'Lettuce', variety: ['Lettuce v1', 'Lettuce v2'] },
  { commodity: 'Strawberry', variety: ['Strawberry v1', 'Strawberry v2'] },
  { commodity: 'Broccoli', variety: ['Broccoli v1', ' Broccoli v2', 'Broccoli v3'] },
  { commodity: 'Tomato', variety: ['Tomato v1'] },
  ];

  variety: Array<any>;
  changeCommodity(count) {
    this.variety = this.commodityList.find(con => con.commodity === count).variety;
  }

  constructor(private titleService: TitleService, private fb: FormBuilder) {
    this.form = this.fb.group({
      ranch: ['', [Validators.required, Validators.min(1)]],
      lotNumber: ['', [Validators.required, Validators.min(1)]],
      acreSize: ['', [Validators.required, Validators.min(1)]],
      cropYear: ['', [Validators.required, Validators.min(2018), Validators.max(2020)]],
      cropNumber: ['', [Validators.required, Validators.min(1), Validators.max(4)]],
      commodity: ['', [Validators.required, Validators.min(1)]],
      variety: ['', [Validators.required, Validators.min(1)]],
      bedCount: ['', [Validators.required, Validators.min(1), Validators.max(2)]],
      seedLotNumber: ['', [Validators.required, Validators.min(1)]],
      bedType: ['', [Validators.required, Validators.min(40), Validators.max(80)]],
      prepMaterial: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Create Card');
  }

  public exampleInput() {
    AlertService.newBasicAlert('testing', false);
  }

  submit() {
    if (this.form.get('ranch').invalid ||
        this.form.get('lotNumber').invalid ||
        this.form.get('acreSize').invalid ||
        this.form.get('cropYear').invalid ||
        this.form.get('cropNumber').invalid ||
        this.form.get('commodity').invalid ||
        this.form.get('variety').invalid ||
        this.form.get('bedCount').invalid ||
        this.form.get('seedLotNumber').invalid ||
        this.form.get('bedType').invalid ||
        this.form.get('prepMaterial').invalid) {
          this.submitAttempted = true;
      } else {
      this.submitAttempted = false;
    }
  }

}

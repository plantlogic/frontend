import { CardEntryService } from './../../../_api/card-entry.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TitleService } from '../../../_interact/title.service';
import { AlertService } from '../../../_interact/alert/alert.service';
import { Component, OnInit, EventEmitter } from '@angular/core';
import {Alert} from '../../../_interact/alert/alert';
import { Router } from '@angular/router';
import { Card } from '../../../_dto/card/card';
import { AuthService } from 'src/app/_auth/auth.service';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card-entry.component.html',
  styleUrls: ['./create-card-entry.component.scss']
})
export class CreateCardEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder, private router: Router,
              private cardEntryService: CardEntryService, private auth: AuthService) { }

  form: FormGroup;
  newCard: Card;
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
  prepMaterial: Array<any> = ['Lorsban', 'Diaznon', 'Kerb', 'Dacthal'];

  changeCommodity(count) {
    this.variety = this.commodityList.find(con => con.commodity === count).variety;
  }

  ngOnInit() {
    this.titleService.setTitle('Create Card');
    this.form = this.fb.group({
      ranch: ['', [Validators.required, Validators.minLength(1)]],
      lotNumber: ['', [ Validators.minLength(1)]],
      acreSize: ['', [ Validators.required, Validators.min(0.1), Validators.max(499.9)]],
      cropYear: ['', [ Validators.min(1000), Validators.max(9999)]],
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
        this.form.get('acreSize').invalid ||
        this.form.get('cropYear').invalid ||
        this.form.get('cropNumber').invalid ||
        this.form.get('commodity').invalid ||
        this.form.get('seedLotNumber').invalid ||
        this.form.get('bedType').invalid ||
        this.form.get('prepMaterial').invalid) {
        this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
     // this.confirmfAlert(this.form.get('ranch').value, this.form.get('acreSize').value,
     // this.form.get('cropYear').value, this.form.get('commodity').value, this.form.get('variety').value );
      this.newCard.ranchManagerName = this.auth.getUsername();
      this.newCard.ranchName = this.form.get('ranch').value;
      this.newCard.totalAcres = this.form.get('acreSize').value;
      this.newCard.cropYear = this.form.get('cropYear').value;
      this.newCard.commodity = this.form.get('commodity').value;
      this.newCard.variety = this.form.get('variety').value;
      this.cardEntryService.createCard(this.newCard).subscribe(
        data => {
          if (data.success) {
            this.newCard = data.data;
            this.router.navigateByUrl('/entry');
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again', true);
        }
      );
      this.router.navigate(['/manage']);
    }
  }

  confirmfAlert(ranchName: string, acreSize: number, cropYear: number, comm: string, va: string): void {
    const newAlert = new Alert();

    newAlert.title = 'Confirm';
    newAlert.showClose = true;
    newAlert.closeName = 'Submit';
    newAlert.timeLeft = 10;
    newAlert.message = 'Are you sure you want to create a new card with the following information? Ranch: ' + ranchName
    + '\nAcre Size: ' + acreSize + '\nCrop Year: ' + cropYear + 'Commodity: ' + comm + '\nVariety: ' + va;
    newAlert.color = 'success';
    newAlert.blockPageInteraction = true;
    AlertService.newAlert(newAlert);
  }

}

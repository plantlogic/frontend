import { IrrigationEntry } from './../../../../_dto/card/irrigation-entry';
import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/_interact/title.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CardEntryService } from 'src/app/_api/card-entry.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-irrigation',
  templateUrl: './add-irrigation-entry.component.html',
  styleUrls: ['./add-irrigation-entry.component.scss']
})
export class AddIrrigationEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder,
              private cardEntryService: CardEntryService, private router: Router) { }

  irrigationEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['Lorsban', 'Diaznon', 'Kerb', 'Dacthal'];
  irrigationEntry: IrrigationEntry;

  ngOnInit() {
    this.titleService.setTitle('Add Irrigation Data');
    this.irrigationEntryForm = this.fb.group({
      workDate: ['', [ Validators.required, Validators.min(1)] ],
      method: ['', [ Validators.required, Validators.minLength(1)]],
      fertilizer: ['', [ Validators.required]],
      gallons: ['', [ Validators.required, Validators.min(0.1), Validators.max(999.9)]]
    });
    this.irrigationEntryForm.valueChanges.subscribe(console.log);
  }

  submit() {
    if ( this.irrigationEntryForm.get('workDate').invalid ||
        this.irrigationEntryForm.get('method').invalid ||
        this.irrigationEntryForm.get('fertilizer').invalid ||
        this.irrigationEntryForm.get('gallons').invalid) {
        this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      console.log('success');
      this.irrigationEntry.fertilizer = this.irrigationEntryForm.get('fertilizer').value;
      this.irrigationEntry.gallons = this.irrigationEntryForm.get('gallons').value;
      this.irrigationEntry.method = this.irrigationEntryForm.get('method').value;
      this.irrigationEntry.workDate = this.irrigationEntryForm.get('workDate').value;

      this.cardEntryService.addIrrigationData('this.cardEntryService.getCardById() ', this.irrigationEntry).subscribe(
        data => {
          if (data.success) {
            this.irrigationEntry = data.data;
            this.router.navigateByUrl('/entry');
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again', true);
        }
      );
     // this.router.navigate(['/manage']);
    }
  }

}

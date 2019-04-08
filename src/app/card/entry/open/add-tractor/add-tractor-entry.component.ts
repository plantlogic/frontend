import { TractorEntry } from './../../../../_dto/card/tractor-entry';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from 'src/app/_interact/title.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CardEntryService } from 'src/app/_api/card-entry.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import {FlatpickrOptions} from 'ng2-flatpickr';

@Component({
  selector: 'app-add-tractor',
  templateUrl: './add-tractor-entry.component.html',
  styleUrls: ['./add-tractor-entry.component.scss']
})
export class AddTractorEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder,
              private route: ActivatedRoute, private routes: Router,
              private cardEntryService: CardEntryService) { }

  flatpickrOptions: FlatpickrOptions = { dateFormat: 'm-d-Y', defaultDate: new Date(Date.now())};
  tractorEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['Lorsban', 'Diaznon', 'Kerb', 'Dacthal'];
  tractorEntery: TractorEntry = new TractorEntry();
  cardId: string;

  ngOnInit() {
    this.titleService.setTitle('Tractor');
    this.tractorEntryForm = this.fb.group({
      workDate: [Date.now(), [ Validators.required] ],
      workDone: ['', [ Validators.required, Validators.minLength(1)]],
      operator: ['', [ Validators.required, Validators.minLength(1)]],
      fertilizer: ['', [ Validators.required]],
      gallons: ['', [ Validators.required, Validators.min(0.1), Validators.max(999.9)]]
    });
    this.route.params.subscribe(data => this.cardId = data.id);
    this.tractorEntryForm.valueChanges.subscribe(console.log);
    console.log(this.cardId);
  }

  submit() {
    if ( this.tractorEntryForm.get('workDate').invalid ||
        this.tractorEntryForm.get('workDone').invalid ||
        this.tractorEntryForm.get('operator').invalid ||
        this.tractorEntryForm.get('fertilizer').invalid ||
        this.tractorEntryForm.get('gallons').invalid) {
        this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      console.log('success');
      this.tractorEntery.fertilizer = this.tractorEntryForm.get('fertilizer').value;
      this.tractorEntery.gallons = this.tractorEntryForm.get('gallons').value;
      this.tractorEntery.workDone = this.tractorEntryForm.get('workDone').value;
      this.tractorEntery.workDate = this.tractorEntryForm.get('workDate').value;
      this.tractorEntery.operator = this.tractorEntryForm.get('operator').value;

      this.cardEntryService.addTractorData(this.cardId, this.tractorEntery).subscribe(
        data => {
          if (data.success) {
            this.tractorEntery = data.data;
            this.routes.navigateByUrl('/entry');
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

}

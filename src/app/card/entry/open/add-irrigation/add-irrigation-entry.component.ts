import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/_interact/title.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-irrigation',
  templateUrl: './add-irrigation-entry.component.html',
  styleUrls: ['./add-irrigation-entry.component.scss']
})
export class AddIrrigationEntryComponent implements OnInit {

  constructor(private titleService: TitleService, private fb: FormBuilder) { }

  irrigationEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['fertilizer 1', 'fertilizer 2', 'fertilizer 3'];

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
     // this.router.navigate(['/manage']);
    }
  }

}

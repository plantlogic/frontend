import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from 'src/app/_interact/title.service';

@Component({
  selector: 'app-add-tractor',
  templateUrl: './add-tractor-entry.component.html',
  styleUrls: ['./add-tractor-entry.component.scss']
})
export class AddTractorEntryComponent implements OnInit {
  constructor(private titleService: TitleService, private fb: FormBuilder) { }

  tractorEntryForm: FormGroup;
  submitAttempted = false;
  fertilizer: Array<any> = ['fertilizer 1', 'fertilizer 2', 'fertilizer 3'];

  ngOnInit() {
    this.titleService.setTitle('Add Tractor Data');
    this.tractorEntryForm = this.fb.group({
      workDate: ['', [ Validators.required, Validators.min(1)] ],
      workDone: ['', [ Validators.required, Validators.minLength(1)]],
      operator: ['', [ Validators.required, Validators.minLength(1)]],
      fertilizer: ['', [ Validators.required]],
      gallons: ['', [ Validators.required, Validators.min(0.1), Validators.max(999.9)]]
    });
    this.tractorEntryForm.valueChanges.subscribe(console.log);
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
     // this.router.navigate(['/manage']);
    }
  }

}

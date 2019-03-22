import { FormGroup, FormControl } from '@angular/forms';
import { AlertService } from '../_interact/alert/alert.service';
import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public exampleInput() {
    AlertService.newBasicAlert('testing', false);
  }
}

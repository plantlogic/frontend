import { Component, OnInit } from '@angular/core';
import { AlertService } from '../_interact/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  public alertService = AlertService;

  constructor() { }

  ngOnInit() {
  }

}

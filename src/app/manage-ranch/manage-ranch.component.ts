import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { AlertService } from '../_interact/alert.service';

@Component({
  selector: 'app-manage-ranch',
  templateUrl: './manage-ranch.component.html',
  styleUrls: ['./manage-ranch.component.scss']
})
export class ManageRanchComponent implements OnInit {

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Manage Ranch');
  }

  public exampleInput() {
    AlertService.newMessage('testing', false);
  }
}

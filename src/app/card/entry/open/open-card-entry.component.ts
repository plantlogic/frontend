import { Component, OnInit } from '@angular/core';
import {TitleService} from '../../../_interact/title.service';

@Component({
  selector: 'app-open-card-entry',
  templateUrl: './open-card-entry.component.html',
  styleUrls: ['./open-card-entry.component.scss']
})
export class OpenCardEntryComponent implements OnInit {

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('View Card');
  }

}

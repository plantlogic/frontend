import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Home');
  }
}

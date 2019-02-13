import { Component, OnInit } from '@angular/core';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  siteTitle: string;

  constructor(private titleService: TitleService) {
    this.siteTitle = titleService.getSiteTitle();
  }

  ngOnInit() {
  }

}

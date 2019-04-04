import { Component, OnInit } from '@angular/core';
import {NavService} from '../../_interact/nav.service';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  constructor(private navService: NavService) { }

  ngOnInit() {
  }

  goBack(): void {
    this.navService.goBack();
  }

  hasParent(): boolean {
    return this.navService.hasParent();
  }
}

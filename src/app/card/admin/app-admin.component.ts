import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/_interact/title.service';

@Component({
  selector: 'app-admin',
  templateUrl: './app-admin.component.html',
  styleUrls: ['./app-admin.component.scss']
})
export class AppAdminComponent implements OnInit {
  editing: boolean;
  ranchList: Array<any> = [
    { id: '123', name: 'Ranch 1', manager: 'Manager 1'},
    { id: '456', name: 'Ranch 2', manager: 'Manager 2'},
    { id: '789', name: 'Ranch 3', manager: 'Manager 3'},
    { id: '1011', name: 'Ranch 4', manager: 'Manager 4'},
    { id: '1213', name: 'Ranch 5', manger: 'Manger 5'}
  ];

  headElementsRanch: Array<any> = ['ID', 'Ranch', 'Ranch Manager', 'Remove'];

  chemicalList: Array<any> = [
    {name: 'chemical 1', type: 'fertilizer'},
    {name: 'chemical 2', type: 'fertilizer'},
    {name: 'chemical 3', type: 'herbicide'},
    {name: 'chemical 4', type: 'herbicide'},
    {name: 'chemical 5', type: 'insecticide'},
    {name: 'chemical 6', type: 'insecticide'},
  ];

  headElementsChem: Array<any> = ['Checmical', 'Type', 'Remove'];

  commodityList: Array<any> = [
    { seedLot: '123', commodity: 'Lettuce', variety: 'Lettuce 1'},
    { seedLot: '456', commodity: 'Lettuce', variety: 'Lettuce 2'},
    { seedLot: '789', commodity: 'Strawberry', variety: 'Stawberry 3'},
    { seedLot: '1011', commodity: 'Tomatoe', variety: 'Tomatoe 4'},
    { seedLot: '1213', commodity: 'Tomatoe', variety: 'Tomatoe 5'}
  ];

  headElementsComm: Array<any> = ['Seed Lot', 'Commodity', 'Variety', 'Remove'];

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Common Data Management');
  }

  removeRanch(id: number) {

  }
}

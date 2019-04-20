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

  headElementsRanch: Array<any> = ['Ranch', 'Ranch Manager', 'Remove'];

  chemicalList: Array<any> = [
    {name: 'chemical 1'},
    {name: 'chemical 2'},
    {name: 'chemical 3'},
    {name: 'chemical 4'},
    {name: 'chemical 5'},
    {name: 'chemical 6'}
  ];

  headElementsChem: Array<any> = ['Checmical', 'Remove'];

  commodityList: Array<any> = [
    { seedLot: '123', commodity: 'Lettuce', variety: 'Lettuce 1'},
    { seedLot: '456', commodity: 'Lettuce', variety: 'Lettuce 2'},
    { seedLot: '789', commodity: 'Strawberry', variety: 'Stawberry 3'},
    { seedLot: '1011', commodity: 'Tomatoe', variety: 'Tomatoe 4'},
    { seedLot: '1213', commodity: 'Tomatoe', variety: 'Tomatoe 5'}
  ];

  headElementsComm: Array<any> = ['Seed Lot', 'Commodity', 'Variety', 'Remove'];

  fertilizerList: Array<any> = [
    {name: 'fertilizer 1'},
    {name: 'fertilizer 2'},
    {name: 'fertilizer 3'},
    {name: 'fertilizer 4'},
    {name: 'fertilizer 5'},
    {name: 'fertilizer 6'}
  ];
  headElementsF: Array<any> = ['Fertilizer', 'Remove'];

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Common Data Management');
  }

  removeRanch(id: number) {

  }
}

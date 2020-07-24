import {Component, OnInit, ViewChild} from '@angular/core';
import {TitleService} from '../_interact/title.service';
import {AuthService} from '../_auth/auth.service';
import {PlRole} from '../_dto/user/pl-role.enum';
import {Router} from '@angular/router';
import {Chart} from 'chart.js';
import {CardViewService} from '../_api/card-view.service';
import {Card} from '../_dto/card/card';
import {AlertService} from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {CardEntryService} from '../_api/card-entry.service';
import {UserService} from '../_api/user.service';
import {environment} from '../../environments/environment';
import { CommonLookup } from '../_api/common-data.service';
import { CommonFormDataService } from '../_api/common-form-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private titleService: TitleService, private auth: AuthService, private router: Router,
              private cardView: CardViewService, private cardEntry: CardEntryService, private userManagement: UserService,
              public common: CommonFormDataService) { }

  message: string;
  appname = environment.AppName;

  dataEntryElements = false;
  cardCount: number;

  dataViewElements = false;
  cardHarvestedChart: Chart;
  @ViewChild('cardHarvestedChartRef') private cardHarvestedChartRef;
  openCommoditiesChart: Chart;
  @ViewChild('openCommoditiesChartRef') private openCommoditiesChartRef;
  commodityAcresChart: Chart;
  @ViewChild('commodityAcresChartRef') private commodityAcresChartRef;
  totalCommodityAcres = 0;

  userManagementElements = false;
  userCount: number;

  commonKeys = ['commodities'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  redirecting = false;

  permissions = {};

  ngOnInit() {
    /* ----------------
    Page Init
    ------------------- */
    this.titleService.setTitle('Home');
    this.setPermissions();
    if (this.hasAnyViewPermission()) {
      const tempThis = this;
      this.initCommon((c) => {
        tempThis.commonKeys.forEach(key => tempThis[`${key}`] = c[`${key}`]);
        tempThis.getCardCount();
        tempThis.generateCardsHarvestedChart();
        tempThis.generateCommodityAcresChart();
        tempThis.generateOpenCommoditiesChart();
        tempThis.generateUserManagementElements();
      });
    } else {
      this.message = 'No view permission found, contact an administrator to be given access to view cards.'
                    + 'This can happen if a user has no permissions or has only edit permissions (e.g. Contractor Edit or Data Edit).';
    }
  }

  /*
    Searches common values in [`${key}`] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find((e) => {
      return e.id === targetID;
    });
    try {
      valuePropertyArr.forEach(p => {
        commonValue = commonValue[p];
      });
    } catch (e) {
      console.log(e);
    }
    return (commonValue) ? commonValue : targetID;
  }

  private generateUserManagementElements(): void {
    if (this.showRegisteredUsers()) {
      this.userManagement.getUserList().subscribe((data) => {
          if (data.success) {
            this.userCount = data.data.length;
          } else if (!data.success) {
            AlertService.newBasicAlert('Error when retrieving user information', true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error', true);
        });
    }
  }

  private generateCommodityAcresChart(): void {
    const tempThis = this;
    const orderedPairs = [];
    let permission: string;
    let shipperID: string;

    if (this.permissions[`DATA_ENTRY`] || this.permissions[`IRRIGATOR`]) {
      permission = 'entry';
    } else if (this.permissions[`DATA_VIEW`]) {
      permission = 'view';
    } else if (this.permissions[`SHIPPER`]) {
      permission = 'shipper';
      shipperID = this.auth.getShipperID();
    } else {
      return;
    }
    this.cardEntry.getCommodityAcres(permission, shipperID).subscribe(
      data => {
        if (data.success) {
          const pairs: Map<string, number> = data.data;
          for (const [k, v] of Object.entries(pairs)) {
            orderedPairs.push({
              key: tempThis.findCommonValue('commodities', ['value', 'key'], k),
              value: v
            });
            tempThis.totalCommodityAcres += v;
          }
          orderedPairs.sort((a, b) => {
            let comparison = 0;
            const valA = a.key.toUpperCase();
            const valB = b.key.toUpperCase();
            if (valA > valB) {
              comparison = 1;
            } else if (valA < valB) {
              comparison = -1;
            }
            return comparison;
          });
          // Round Total Acre Value
          tempThis.totalCommodityAcres = Number(tempThis.totalCommodityAcres.toFixed(2));
          this.commodityAcresChart = new Chart(this.commodityAcresChartRef.nativeElement, {
            type: 'bar',
            data: {
              type: 'line',
              labels: orderedPairs.map((e) => e.key),
              datasets: [
                {
                  data: orderedPairs.map((e) => e.value),
                  borderColor: '#00AEFF',
                  backgroundColor: 'rgba(0,174,255,0.42)',
                }
              ]
            },
            options: {
              legend: {
                display: false
              },
              scales: {
                xAxes: [{
                  display: true
                }],
                yAxes: [{
                  display: true,
                  ticks: {
                    precision: 0
                  }
                }],
              }
            }
          });
        } else {
          console.log('Error');
        }
      },
      failure => {
        console.log('Error');
      }
    );
  }

  private generateOpenCommoditiesChart(): void {
    const tempThis = this;
    const orderedPairs = [];
    let permission: string;
    let shipperID: string;

    if (this.permissions[`DATA_ENTRY`] || this.permissions[`IRRIGATOR`]) {
      permission = 'entry';
    } else if (this.permissions[`DATA_VIEW`]) {
      permission = 'view';
    } else if (this.permissions[`SHIPPER`]) {
      permission = 'shipper';
      shipperID = this.auth.getShipperID();
    } else {
      return;
    }
    this.cardEntry.getCommodityCardCount(permission, shipperID).subscribe(
      data => {
        if (data.success) {
          const pairs: Map<string, number> = data.data;
          for (const [k, v] of Object.entries(pairs)) {
            orderedPairs.push({
              key: tempThis.findCommonValue('commodities', ['value', 'key'], k),
              value: v
            });
          }
          orderedPairs.sort((a, b) => {
            let comparison = 0;
            const valA = a.key.toUpperCase();
            const valB = b.key.toUpperCase();
            if (valA > valB) {
              comparison = 1;
            } else if (valA < valB) {
              comparison = -1;
            }
            return comparison;
          });
          // Round Total Acre Value
          tempThis.totalCommodityAcres = Number(tempThis.totalCommodityAcres.toFixed(2));
          this.openCommoditiesChart = new Chart(this.openCommoditiesChartRef.nativeElement, {
            type: 'bar',
            data: {
              type: 'line',
              labels: orderedPairs.map((e) => e.key),
              datasets: [
                {
                  data: orderedPairs.map((e) => e.value),
                  borderColor: '#00AEFF',
                  backgroundColor: 'rgba(0,174,255,0.42)',
                }
              ]
            },
            options: {
              legend: {
                display: false
              },
              scales: {
                xAxes: [{
                  display: true
                }],
                yAxes: [{
                  display: true,
                  ticks: {
                    precision: 0
                  }
                }],
              }
            }
          });
        } else {
          console.log('Error');
        }
      },
      failure => {
        console.log('Error');
      }
    );
  }

  private generateCardsHarvestedChart(): void {
    // Init our date array
    const recent = [];
    for (let i = 5; i >= 0; i--) {
      recent.push(this.months[((new Date()).getMonth() - i + 12) % 12]);
    }
    this.months = recent;
    let permission: string;
    let shipperID: string;

    if (this.permissions[`DATA_ENTRY`] || this.permissions[`IRRIGATOR`]) {
      permission = 'entry';
    } else if (this.permissions[`DATA_VIEW`]) {
      permission = 'view';
    } else if (this.permissions[`SHIPPER`]) {
      permission = 'shipper';
      shipperID = this.auth.getShipperID();
    } else {
      return;
    }
    this.cardEntry.getRecentlyHarvested(permission, shipperID).subscribe(
      data => {
        if (data.success) {
          this.cardHarvestedChart = new Chart(this.cardHarvestedChartRef.nativeElement, {
            type: 'line',
            data: {
              type: 'line',
              labels: this.months,
              datasets: [
                {
                  data: data.data,
                  borderColor: '#00AEFF',
                  backgroundColor: 'rgba(0,174,255,0.42)',
                  fill: 'origin'
                }
              ]
            },
            options: {
              elements: {
                line: {
                  tension: 0.000001
                }
              },
              legend: {
                display: false
              },
              scales: {
                xAxes: [{
                  display: true
                }],
                yAxes: [{
                  display: true,
                  ticks: {
                    precision: 0
                  }
                }],
              }
            }
          });
        } else {
          console.log('Error');
        }
      },
      failure => {
        console.log('Error');
      }
    );
  }

  private getCardCount() {
    let permission: string;
    let shipperID: string;

    if (this.permissions[`DATA_ENTRY`] || this.permissions[`IRRIGATOR`]) {
      permission = 'entry';
    } else if (this.permissions[`DATA_VIEW`]) {
      permission = 'view';
    } else if (this.permissions[`SHIPPER`]) {
      permission = 'shipper';
      shipperID = this.auth.getShipperID();
    } else {
      return;
    }
    this.cardEntry.getCardCount(permission, shipperID).subscribe( data => {
      if (data.success) {
        this.cardCount = data.data;
      } else {
        console.log(data.error);
      }
    }, failure => {
      console.log('Connection Error');
    });
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  private hasAnyViewPermission(): boolean {
    return (this.permissions[`CONTRACTOR_VIEW`]
        || this.permissions[`DATA_ENTRY`]
        || this.permissions[`DATA_VIEW`]
        || this.permissions[`IRRIGATOR`]
        || this.permissions[`SHIPPER`]);
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    this.common.getAllValues((data) => {
      this.commonKeys.forEach(key => {
        if (CommonLookup[`${key}`].type === 'hashTable') {
          const temp = [];
          data[`${key}`].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(data[`${key}`], key);
        }
      });
      f(sortedCommon);
    });
  }

  // Set permissions for page display items
  private setPermissions() {
    const keys = Object.keys(PlRole);
    const  roles = keys.slice(keys.length / 2);
    roles.forEach((role) => {
      if (this.auth.hasPermission(PlRole[role])) {
        this.permissions[role] = true;
      }
    });
  }

  // PERMISSION CHECKS
  public showCountOrCharts() {
    return this.showDataEntryCountOrCharts()
        || this.showDataViewCountOrCharts()
        || this.showShipperCountOrCharts();
  }

  public showDataOpenButton() {
    return !this.showEntryOpenButton()
        && (this.permissions[`CONTRACTOR_VIEW`]
        || this.permissions[`DATA_VIEW`]
        || this.permissions[`SHIPPER`]);
  }

  public showDataViewCountOrCharts() {
    return this.permissions[`DATA_VIEW`]
        || this.permissions[`CONTRACTOR_VIEW`];
  }

  public showEntryOpenButton() {
    return this.permissions[`DATA_ENTRY`]
        || this.permissions[`IRRIGATOR`];
  }

  public showDataEntryCountOrCharts() {
    return !this.showDataViewCountOrCharts()
        && (this.permissions[`DATA_ENTRY`]
        || this.permissions[`IRRIGATOR`]);
  }

  public showNewCardButton() {
    return this.permissions[`DATA_ENTRY`];
  }

  public showRegisteredUsers() {
    return this.permissions[`USER_MANAGEMENT`];
  }

  public showShipperCountOrCharts() {
    return !this.showDataEntryCountOrCharts()
        && !this.showDataViewCountOrCharts()
        && this.permissions[`SHIPPER`];
  }
}

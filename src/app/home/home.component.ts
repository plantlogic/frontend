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
  totalCommodityAcres: number = 0;

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
      this.initCommon(c => {
        tempThis.commonKeys.forEach(key => tempThis[key] = c[key]);
        if (tempThis.auth.permissionCount() === 0) {
          tempThis.message = 'This account is disabled and has no permissions.';
        }
        // Init our date array
        const recent = [];
        for (let i = 5; i >= 0; i--) {
          recent.push(tempThis.months[((new Date()).getMonth() - i + 12) % 12]);
        }
        tempThis.months = recent;

        // Init our data array
        tempThis.generateChartsAndCount();
        tempThis.generateUserManagementElements();
      });
    } else {
      this.message = 'No view permission found, contact an administrator to be given access to view cards.'
                    + 'This can happen if a user has no permissions or has only edit permissions (e.g. Contractor Edit or Data Edit).';
    }
  }

  /*
    Searches common values in [key] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find(e => {
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

  private generateChartsAndCount() {
    if (this.showDataEntryCountOrCharts()) {
      this.cardEntry.getMyCards().subscribe(data => {
        if (data.success) {
          this.cardCount = data.data.length;
          this.generateCardsHarvestedChart(data.data);
          this.generateOpenCommoditiesChart(data.data);
          this.generateCommoditieAcresChart(data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      });
    } else if (this.showDataViewCountOrCharts()) {
      this.cardEntry.getDataViewCards().subscribe(data => {
        if (data.success) {
          this.cardCount = data.data.length;
          this.generateCardsHarvestedChart(data.data);
          this.generateOpenCommoditiesChart(data.data);
          this.generateCommoditieAcresChart(data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      });
    } else if (this.showShipperCountOrCharts()) {
      this.cardEntry.getShipperCards(this.auth.getShipperID()).subscribe(data => {
        if (data.success) {
          this.cardCount = data.data.length;
          this.generateCardsHarvestedChart(data.data);
          this.generateOpenCommoditiesChart(data.data);
          this.generateCommoditieAcresChart(data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      });
    }
  }

  private generateUserManagementElements(): void {
    if (this.showRegisteredUsers()) {
      this.userManagement.getUserList().subscribe(data => {
          if (data.success) {
            this.userCount = data.data.length;
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    }
  }

  private generateCommoditieAcresChart(data: Array<Card>): void {
    const tempThis = this;
    const commodities = [];
    const counts = [];

    data.map(c => (new Card()).copyConstructor(c))
      .filter(c => !c.closed)
      .forEach(c => c.commodityArray.forEach(co => {
        const val = tempThis.findCommonValue('commodities', ['value', 'key'], co.commodity);
        const indx = commodities.indexOf(val);
        c.initTotalAcres();
        tempThis.totalCommodityAcres += c.totalAcres;
        if (indx < 0) {
          commodities.push(val);
          counts.push(c.totalAcres);
        } else {
          counts[indx] += c.totalAcres;
        }
      }));

    // Round Total Acre Value
    tempThis.totalCommodityAcres = Number(tempThis.totalCommodityAcres.toFixed(2));

    // sort arrays
    let sortedCommodities = Object.assign([], commodities).sort();
    let sortedCounts = [];
    for (let commodity of sortedCommodities) {
      let originalIndex = commodities.indexOf(commodity);
      let count = counts[originalIndex];
      sortedCounts.push(count);
    }

    this.commodityAcresChart = new Chart(this.commodityAcresChartRef.nativeElement, {
      type: 'bar',
      data: {
        type: 'line',
        labels: sortedCommodities,
        datasets: [
          {
            data: sortedCounts,
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
  }
  private generateOpenCommoditiesChart(data: Array<Card>): void {
    const tempThis = this;
    const commodities = [];
    const counts = [];

    data.map(c => (new Card()).copyConstructor(c))
      .filter(c => !c.closed)
      .forEach(c => c.commodityArray.forEach(co => {
        const val = tempThis.findCommonValue('commodities', ['value', 'key'], co.commodity);
        const indx = commodities.indexOf(val);
        if (indx < 0) {
          commodities.push(val);
          counts.push(1);
        } else {
          counts[indx]++;
        }
      }));

    // sort arrays
    let sortedCommodities = Object.assign([], commodities).sort();
    let sortedCounts = [];
    for (let commodity of sortedCommodities) {
      let originalIndex = commodities.indexOf(commodity);
      let count = counts[originalIndex];
      sortedCounts.push(count);
    }

    this.openCommoditiesChart = new Chart(this.openCommoditiesChartRef.nativeElement, {
      type: 'bar',
      data: {
        type: 'line',
        labels: sortedCommodities,
        datasets: [
          {
            data: sortedCounts,
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
  }

  private generateCardsHarvestedChart(data: Array<Card>): void {
    const result = [0, 0, 0, 0, 0, 0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    data.map(c => new Date(c.harvestDate))
      .filter(d => sixMonthsAgo < d && d.valueOf() <= Date.now())
      .forEach(d => {
        result[5 - (((new Date()).getMonth() - d.getMonth() + 12) % 12)]++;
      });

    this.cardHarvestedChart = new Chart(this.cardHarvestedChartRef.nativeElement, {
      type: 'line',
      data: {
        type: 'line',
        labels: this.months,
        datasets: [
          {
            data: result,
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
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[key]) ? this[key] : [];
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
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
        if (CommonLookup[key].type === 'hashTable') {
          const temp = [];
          data[key].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[key] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
        }
      });
      f(sortedCommon);
    });
  }

  // Set permissions for page display items
  private setPermissions() {
    const keys = Object.keys(PlRole);
    const  roles = keys.slice(keys.length / 2);
    roles.forEach(role => {
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

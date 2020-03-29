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

  message = '';
  appname = environment.AppName;

  dataEntryElements = false;
  cardCount: number;

  dataViewElements = false;
  cardHarvestedChart: Chart;
  @ViewChild('cardHarvestedChartRef') private cardHarvestedChartRef;
  openCommoditiesChart: Chart;
  @ViewChild('openCommoditiesChartRef') private openCommoditiesChartRef;

  userManagementElements = false;
  userCount: number;

  commonKeys = ['commodities'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  ngOnInit() {
    /* ----------------
    Redirects
    ------------------- */

    if (this.auth.hasPermission(PlRole.DATA_ENTRY)) {
      // If on a mobile device, redirect to data entry
      if (window.matchMedia('only screen and (max-width: 760px)').matches) {
        this.router.navigate(['/entry']);
      }

      // Go straight to the create card page if only permission is data entry
      if (this.auth.permissionCount() === 1) {
        this.router.navigate(['/entry']);
      }
    }

    /* ----------------
    Page Init
    ------------------- */

    this.titleService.setTitle('Home');
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
      if (tempThis.auth.hasPermission(PlRole.DATA_ENTRY)) {
        tempThis.generateDataEntryElements();
      }
      if (tempThis.auth.hasPermission(PlRole.DATA_VIEW)) {
        tempThis.generateDataViewElements();
      }
      if (tempThis.auth.hasPermission(PlRole.APP_ADMIN)) {

      }
      if (tempThis.auth.hasPermission(PlRole.USER_MANAGEMENT)) {
        tempThis.generateUserManagementElements();
      }
    });
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

  private generateUserManagementElements(): void {
    this.userManagementElements = true;
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

  private generateDataEntryElements(): void {
    this.dataEntryElements = true;
    this.cardEntry.getMyCards().subscribe(data => {
        if (data.success) {
          this.cardCount = data.data.length;
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      });
  }

  private generateDataViewElements(): void {
    this.dataViewElements = true;
    this.cardView.getAllCards().subscribe(
      data => {
        if (data.success) {
          this.generateCardsHarvestedChart(data.data);
          this.generateOpenCommoditiesChart(data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
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

    this.openCommoditiesChart = new Chart(this.openCommoditiesChartRef.nativeElement, {
      type: 'bar',
      data: {
        type: 'line',
        labels: commodities,
        datasets: [
          {
            data: counts,
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

}

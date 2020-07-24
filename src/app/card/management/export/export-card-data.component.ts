import {CommonFormDataService} from './../../../_api/common-form-data.service';
import {Component, OnInit} from '@angular/core';
import {CardExportService} from '../../../_api/card-export.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardViewService} from '../../../_api/card-view.service';
import {NavService} from '../../../_interact/nav.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { AuthService } from 'src/app/_auth/auth.service';
import { ExportPresetService } from 'src/app/_api/export-preset.service';
import {Router} from '@angular/router';
import { PlRole } from 'src/app/_dto/user/pl-role.enum';

@Component({
  selector: 'app-export',
  templateUrl: './export-card-data.component.html',
  styleUrls: ['./export-card-data.component.scss']
})
export class ExportCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardExport: CardExportService, public cardService: CardViewService,
              private nav: NavService, public common: CommonFormDataService, private auth: AuthService,
              public exportPresetService: ExportPresetService, private router: Router) {}

  loading = true;
  generating = false;

  fromDate: number = Date.now();
  toDate: number = Date.now();
  includeUnharvested = false;

  selectedRanches = [];
  selectedCommodities = [];

  multiselectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  presets = [];
  selectedPresetId = 'd1';

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['commodities'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Export Data');
    this.initPresets();
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
    });
  }

  public editPreset() {
    if (this.selectedPresetId) {
      switch (this.selectedPresetId) {
        case 'd1':
        case 'd2':
        case 'd3':
          // Cant open defaults
          break;
        default:
          this.router.navigate(['manage/export/edit/' + this.selectedPresetId]);
          break;
      }
    }
  }

  public exportPreset() {
    if (this.selectedPresetId) {
      switch (this.selectedPresetId) {
        case 'd1':
          this.generate();
          break;
        case 'd2':
          this.generateAllApplied();
          break;
        case 'd3':
          this.generateFertilizerApplied();
          break;
        default:
          // run export with custom preset
          this.generateCustom();
          break;
      }
    }
  }

  fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }

  generate(): void {
    this.generating = true;
    this.fromDate = (new Date(this.fromDate)).valueOf();
    this.toDate = (new Date(this.toDate)).valueOf();
    const ranchIDS = this.selectedRanches.map(e => e.id);
    const commodityIDS = this.selectedCommodities.map(e => e.id);
    this.cardExport.export(this.fromDate, this.toDate, ranchIDS, commodityIDS, this.includeUnharvested);
    this.generating = false;
  }

  generateAllApplied(): void {
    this.generating = true;
    this.fromDate = (new Date(this.fromDate)).valueOf();
    this.toDate = (new Date(this.toDate)).valueOf();
    const ranchIDS = this.selectedRanches.map(e => e.id);
    const commodityIDS = this.selectedCommodities.map(e => e.id);
    this.cardExport.exportAllApplied(this.fromDate, this.toDate, ranchIDS, commodityIDS, this.includeUnharvested);
    this.generating = false;
  }

  generateCustom(): void {
    // Get selected preset
    this.exportPresetService.getExportPresetById(this.selectedPresetId).subscribe(
      data => {
        if (data.success) {
          this.generating = true;
          this.fromDate = (new Date(this.fromDate)).valueOf();
          this.toDate = (new Date(this.toDate)).valueOf();
          const ranchIDS = this.selectedRanches.map(e => e.id);
          const commodityIDS = this.selectedCommodities.map(e => e.id);
          this.cardExport.exportCustom(this.fromDate, this.toDate, ranchIDS, commodityIDS, this.includeUnharvested, data.data);
          this.generating = false;

        } else if (!data.success) {
          AlertService.newBasicAlert('Error when retrieving preset: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Error when retrieving preset: ' + failure.message, true);
      }
    );
  }

  generateFertilizerApplied(): void {
    this.generating = true;
    this.fromDate = (new Date(this.fromDate)).valueOf();
    this.toDate = (new Date(this.toDate)).valueOf();
    const ranchIDS = this.selectedRanches.map(e => e.id);
    const commodityIDS = this.selectedCommodities.map(e => e.id);
    this.cardExport.exportAllFertilizerApplied(this.fromDate, this.toDate, ranchIDS, commodityIDS, this.includeUnharvested);
    this.generating = false;
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
    const userRanchAccess = this.auth.getRanchAccess();
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
      sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  public initPresets() {
    this.exportPresetService.getExportPresets().subscribe(
      data => {
        if (data.success) {
          this.presets = [];
          data.data.forEach((preset) => {
            this.presets.push({
              id: preset.id,
              value: preset.name
            });
            this.presets.sort((a, b) => {
              let comparison = 0;
              const valA = a.value.toUpperCase();
              const valB = b.value.toUpperCase();
              if (valA > valB) {
                comparison = 1;
              } else if (valA < valB) {
                comparison = -1;
              }
              return comparison;
            });
          });
        } else if (!data.success) {
          AlertService.newBasicAlert('Error when retrieving presets: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Error when retrieving presets: ' + failure.message, true);
      }
    );
  }

  public isAppAdmin() {
    return this.auth.hasPermission(PlRole.APP_ADMIN);
  }

  public isCustom(): boolean {
    if (this.selectedPresetId) {
      switch (this.selectedPresetId) {
        case 'd1':
        case 'd2':
        case 'd3':
          return false;
        default:
          return true;
      }
    }
    return false;
  }

  private loadCardData() {
    const tempThis = this;
    const ranchList = [];
    const commodityList = [];

    this.cardService.getUniqueRanches().subscribe(
      (data) => {
        data.data.forEach((ranchId) => {
          if (!ranchList.find(e => e.id === ranchId)) {
            ranchList.push(tempThis[`ranches`].find(e => e.id === ranchId));
          }
        });
        // Reassign common values to values found in at least one card
        this[`ranches`] = tempThis.common.sortCommonArray(ranchList, 'ranches');
        this.loading = false;
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        this.nav.goBack();
      }
    );

    this.cardService.getUniqueCommodities().subscribe(
      (data) => {
        data.data.forEach((commodityId) => {
          if (!commodityList.find(e => e.id === commodityId)) {
            commodityList.push(tempThis[`commodities`].find(e => e.id === commodityId));
          }
        });
        this[`commodities`] = tempThis.common.sortCommonArray(commodityList, 'commodities').map(e => {
          return {id: e.id, value: e.value.key};
        });
        this.loading = false;
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        this.nav.goBack();
      }
    );
  }
}

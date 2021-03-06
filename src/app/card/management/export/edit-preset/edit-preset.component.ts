import { Component, OnInit, EventEmitter } from '@angular/core';
import { NavService } from 'src/app/_interact/nav.service';
import { TitleService } from 'src/app/_interact/title.service';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';
import { AuthService } from 'src/app/_auth/auth.service';
import { ExportPreset } from 'src/app/_dto/card/export-preset';
import { ExportPresetService } from 'src/app/_api/export-preset.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import { ActivatedRoute } from '@angular/router';
import { Alert } from 'src/app/_interact/alert/alert';
import { PlRole } from 'src/app/_dto/user/pl-role.enum';

@Component({
  selector: 'app-edit-preset',
  templateUrl: './edit-preset.component.html',
  styleUrls: ['./edit-preset.component.scss']
})
export class EditPresetComponent implements OnInit {

  constructor(private titleService: TitleService, public exportPresetService: ExportPresetService, private route: ActivatedRoute,
              private nav: NavService, public common: CommonFormDataService, private auth: AuthService) {}

  preset: ExportPreset;
  displayOrder = [
    'card',
    'commodities',
    'thinCrews',
    'hoeCrews',
    'irrigationEntry',
    'irrigationEntryFertilizers',
    'irrigationEntryChemicals',
    'tractorEntry',
    'tractorEntryFertilizers',
    'tractorEntryChemicals',
    'preChemicals',
    'preChemicalsChemical',
    'preChemicalsFertilizer',
  ];

  ngOnInit() {
    this.route.params.subscribe((data) => this.initPreset(data.id));
  }

  public collapseToggle(htmlId: string): void {
    const element = document.getElementById(htmlId);
    if (element) {element.classList.toggle('collapse'); }
  }

  // Converts camel cased property name to a more presentable display name
  // e.g.: 'ranchManagerName' -> 'Ranch Manager Name'
  public getDisplay(propertyName: string): string {
      // Change casing with properties that would not convert correctly
      let result = propertyName.replace('ID', 'Id');
        // Add space between capital letters
      result = result.replace(/([A-Z])/g, ' $1');
      // Convert first character to uppercase and join it to the final string
      return result.charAt(0).toUpperCase() + result.slice(1);
  }

  public initPreset(presetId: string) {
    this.exportPresetService.getExportPresetById(presetId).subscribe(
      (data) => {
        if (data.success) {
          this.preset = Object.assign(new ExportPreset(), data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Failed to open preset: ' + data.error, true);
        }
      },
      (failure) => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
      }
    );
  }

  public isAppAdmin() {
    return this.auth.hasPermission(PlRole.APP_ADMIN);
  }

  public isCollapsed(htmlId: string): boolean {
    const element = document.getElementById(htmlId);
    if (element) {
      return element.classList.contains('collapse');
    } else {
      return true;
    }
  }

  public shiftDown(parentObject: string, key: string) {
    this.preset.shiftDown(parentObject, key);
  }

  public shiftUp(parentObject: string, key: string) {
    this.preset.shiftUp(parentObject, key);
  }

  public saveCopy() {
    const copy = Object.assign(new ExportPreset(), this.preset);
    copy.id = null;
    copy.name += '_copy';

    this.exportPresetService.createExportPreset(copy).subscribe(
      (data) => {
        if (data.success) {
          AlertService.newBasicAlert(`Export preset copied successfully as "${copy.name}"`, false, 30);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
      }
    );
  }

  public submit() {
    if (!this.preset.name) {
      AlertService.newBasicAlert('Error: Please Set Preset Name', true);
      return;
    }
    this.exportPresetService.updateExportPreset(this.preset.id, this.preset).subscribe(
      (data) => {
        if (data.success) {
          AlertService.newBasicAlert('Export preset saved successfully!', false);
          this.nav.goBack();
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      (failure) => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
      }
    );
  }

  public delete() {
    const newAlert = new Alert();
    newAlert.color = 'danger';
    newAlert.title = 'WARNING: Deleting Preset Permanently';
    newAlert.message = 'Are you sure you want to delete this preset? This action cannot be reversed.';
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.actionName = 'Permanently Delete';
    newAlert.actionClosesAlert = true;
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.exportPresetService.deleteExportPreset(this.preset.id).subscribe(
        (data) => {
          if (data.success) {
            AlertService.newBasicAlert('Export preset deleted!', false);
            this.nav.goBack();
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        (failure) => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
        }
      );
    });
    AlertService.newAlert(newAlert);
  }
}

import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/_interact/nav.service';
import { TitleService } from 'src/app/_interact/title.service';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';
import { AuthService } from 'src/app/_auth/auth.service';
import { ExportPreset } from 'src/app/_dto/card/export-preset';
import { ExportPresetService } from 'src/app/_api/export-preset.service';
import { AlertService } from 'src/app/_interact/alert/alert.service';
import { ActivatedRoute } from '@angular/router';

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
    'irrigationEntry',
    'irrigationEntryFertilizers',
    'irrigationEntryChemicals',
    'tractorEntry',
    'tractorEntryFertilizers',
    'tractorEntryChemicals',
    'preChemicals',
    'preChemicalsChemical',
    'preChemicalsFertilizer'
  ];

  ngOnInit() {
    this.route.params.subscribe(data => this.initPreset(data.id));
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
      data => {
        if (data.success) {
          this.preset = Object.assign(new ExportPreset(), data.data);
        } else if (!data.success) {
          AlertService.newBasicAlert('Failed to open preset: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
      }
    );
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

  public submit() {
    this.exportPresetService.updateExportPreset(this.preset.id, this.preset).subscribe(
      data => {
        if (data.success) {
          AlertService.newBasicAlert('Export preset saved successfully!', false);
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message, true);
      }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExportPreset } from '../_dto/card/export-preset';
import { Observable } from 'rxjs';
import { BasicDTO } from '../_dto/basicDTO';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
  })
  export class ExportPresetService {

    constructor(private http: HttpClient) {}

    private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

      public createExportPreset(preset: ExportPreset): Observable<BasicDTO<null>> {
        return this.http.post<BasicDTO<null>>(environment.ApiUrl + '/data/exportPresets/add', preset, this.httpOptions);
      }

      public deleteExportPreset(id: string): Observable<BasicDTO<ExportPreset>> {
        return this.http.delete<BasicDTO<null>>(environment.ApiUrl + '/data/exportPresets/delete/' + id, this.httpOptions);
      }

      public getExportPresets(): Observable<BasicDTO<ExportPreset[]>> {
        return this.http.get<BasicDTO<ExportPreset[]>>(environment.ApiUrl + '/data/exportPresets/view', this.httpOptions);
      }

      public getExportPresetById(id: string): Observable<BasicDTO<ExportPreset>> {
        return this.http.get<BasicDTO<ExportPreset>>(environment.ApiUrl + '/data/exportPresets/view/' + id, this.httpOptions);
      }

      public updateExportPreset(id: string, preset: ExportPreset): Observable<BasicDTO<ExportPreset>> {
        return this.http.put<BasicDTO<ExportPreset>>(environment.ApiUrl + '/data/exportPresets/update/' + id, preset, this.httpOptions);
      }
  }

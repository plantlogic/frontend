import {AuthInjector} from './_auth/auth.injector';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {MDBBootstrapModule, ModalDirective} from 'angular-bootstrap-md';
import {LoadingBarHttpClientModule} from '@ngx-loading-bar/http-client';
import {AutosizeModule} from 'ngx-autosize';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';

import {HomeComponent} from './home/home.component';
import {NavbarComponent} from './navbar/navbar.component';
import {AlertComponent} from './_interact/alert/alert.component';
import {UserManagementComponent} from './user/management/user-management.component';
import {LoginComponent} from './user/login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthRedirectComponent} from './redirects/auth-redirect/auth-redirect.component';
import {CreateCardEntryComponent} from './card/entry/create/create-card-entry.component';
import {AddUserComponent} from './user/management/add-user/add-user.component';
import {LoginRedirectComponent} from './redirects/login-redirect/login-redirect.component';
import {UnderscoreToSpace} from './_pipe/underscore-to-space';
import {ChangePasswordComponent} from './user/self/change-password/change-password.component';
import {ForgotPasswordComponent} from './user/login/forgot-password/forgot-password.component';
import {EditUserComponent} from './user/management/edit-user/edit-user.component';
import {EntryDashboardComponent} from './card/entry/entry-dashboard.component';
import {OpenCardEntryComponent} from './card/entry/open/open-card-entry.component';
import {CloseCardEntryComponent} from './card/entry/open/close/close-card-entry.component';
import {AddTractorEntryComponent} from './card/entry/open/add-tractor/add-tractor-entry.component';
import {AddIrrigationEntryComponent} from './card/entry/open/add-irrigation/add-irrigation-entry.component';
import {CardManagementComponent} from './card/management/card-management.component';
import {OpenCardDataComponent} from './card/management/open/open-card-data.component';
import {ExportCardDataComponent} from './card/management/export/export-card-data.component';
import {CardContractorComponent} from './card/contractor/card-management.component';
import {AppAdminComponent} from './card/admin/app-admin.component';
import {BackButtonComponent} from './navbar/back-button/back-button.component';
import {AddChemicalEntryComponent} from './card/entry/open/add-chemical/add-chemical-entry.component';
import { NoCacheHeadersInterceptor } from './_auth/NoCacheHeadersInterceptor';
import { AddPresetComponent } from './card/management/export/add-preset/add-preset.component';
import { EditPresetComponent } from './card/management/export/edit-preset/edit-preset.component';
import { CardThinHoeComponent } from './card/thinHoe/thinHoe.component';
import { OpenCardThinHoeComponent } from './card/thinHoe/open/open-card-thinHoe.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AlertComponent,
    UserManagementComponent,
    LoginComponent,
    AuthRedirectComponent,
    CreateCardEntryComponent,
    AddUserComponent,
    LoginRedirectComponent,
    UnderscoreToSpace,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    EditUserComponent,
    EntryDashboardComponent,
    OpenCardEntryComponent,
    CloseCardEntryComponent,
    AddTractorEntryComponent,
    AddIrrigationEntryComponent,
    CreateCardEntryComponent,
    CardManagementComponent,
    OpenCardDataComponent,
    ExportCardDataComponent,
    AppAdminComponent,
    BackButtonComponent,
    AddChemicalEntryComponent,
    CardContractorComponent,
    CardThinHoeComponent,
    OpenCardThinHoeComponent,
    AddPresetComponent,
    EditPresetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AutosizeModule,
    LoadingBarHttpClientModule,
    NgMultiSelectDropDownModule.forRoot(),
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    Title,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInjector, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: NoCacheHeadersInterceptor, multi: true}

  ],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }

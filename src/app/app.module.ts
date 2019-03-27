import { AuthInjector } from './_auth/auth.injector';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AlertComponent } from './_interact/alert/alert.component';
import { UserManagementComponent } from './user/management/user-management.component';
import { LoginComponent } from './user/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRedirectComponent } from './redirects/auth-redirect/auth-redirect.component';
import { CreateCardComponent } from './card/entry/create/create-card.component';
import { AddUserComponent } from './user/management/add-user/add-user.component';
import { LoginRedirectComponent } from './redirects/login-redirect/login-redirect.component';
import { UnderscoreToSpace } from './_pipe/underscore-to-space';
import { ChangePasswordComponent } from './user/self/change-password/change-password.component';
import { ForgotPasswordComponent } from './user/login/forgot-password/forgot-password.component';
import { EditUserComponent } from './user/management/edit-user/edit-user.component';
import {EntryComponent} from './card/entry/entry.component';
import {OpenCardEntryComponent} from './card/entry/open/open-card-entry.component';
import {CloseCardComponent} from './card/entry/open/close/close-card.component';
import {AddTractorComponent} from './card/entry/open/add-tractor/add-tractor.component';
import {AddIrrigationComponent} from './card/entry/open/add-irrigation/add-irrigation.component';
import {ManagementComponent} from './card/management/management.component';
import {OpenCardComponent} from './card/management/open/open-card.component';
import {ExportComponent} from './card/management/export/export.component';
import {AdminComponent} from './card/admin/admin.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AlertComponent,
    UserManagementComponent,
    LoginComponent,
    AuthRedirectComponent,
    CreateCardComponent,
    AddUserComponent,
    LoginRedirectComponent,
    UnderscoreToSpace,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    EditUserComponent,
    EntryComponent,
    OpenCardEntryComponent,
    CloseCardComponent,
    AddTractorComponent,
    AddIrrigationComponent,
    CreateCardComponent,
    ManagementComponent,
    OpenCardComponent,
    ExportComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    LoadingBarHttpClientModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    Title,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInjector, multi: true}
  ],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }

import { AuthInjector } from './_auth/auth.injector';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AlertComponent } from './alert/alert.component';
import { DataViewComponent } from './data-view/data-view.component';
import { UserManagementComponent } from './user/management/user-management.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRedirectComponent } from './redirects/auth-redirect/auth-redirect.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { EdituserComponent } from './edituser/edituser.component';
import { AddUserComponent } from './user/management/add-user/add-user.component';
import { LoginRedirectComponent } from './redirects/login-redirect/login-redirect.component';
import { UnderscoreToSpace } from './_pipe/underscore-to-space';
import { ChangePasswordComponent } from './user/self/change-password/change-password.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AlertComponent,
    DataViewComponent,
    UserManagementComponent,
    LoginComponent,
    AuthRedirectComponent,
    CreateCardComponent,
    EdituserComponent,
    AddUserComponent,
    LoginRedirectComponent,
    UnderscoreToSpace,
    ChangePasswordComponent,
    ForgotPasswordComponent
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

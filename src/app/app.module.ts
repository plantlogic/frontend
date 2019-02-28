import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AlertComponent } from './alert/alert.component';
import { DataViewComponent } from './data-view/data-view.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { EdituserComponent } from './edituser/edituser.component';

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
    EdituserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    Title
  ],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }

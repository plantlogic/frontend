import { EdituserComponent } from './edituser/edituser.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DataViewComponent } from './data-view/data-view.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'dataView',
    component: DataViewComponent
  },
  {
    path: 'userManagement',
    component: UserManagementComponent
  },
  {
    path: 'createCard',
    component: CreateCardComponent
  },
  {
    path: 'editUser',
    component: EdituserComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

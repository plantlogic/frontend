import { ChangePasswordComponent } from './change-password/change-password.component';
import { AddUserComponent } from './user-management/add-user/add-user.component';
import { EdituserComponent } from './edituser/edituser.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DataViewComponent } from './data-view/data-view.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard, NotAuthGuard, ChangePasswordGuard } from './_auth/auth.guard';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { LoginRedirectComponent } from './login-redirect/login-redirect.component';


const routes: Routes = [
  {
    path: '',
    component: AuthRedirectComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'loginRedirect',
    component: LoginRedirectComponent
  },
  {
    path: 'dataView',
    component: DataViewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'userManagement',
    component: UserManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'userManagement/addUser',
    component: AddUserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'createCard',
    component: CreateCardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'editUser/:username',
    component: EdituserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthGuard]
  },
  {
    path: 'changePassword',
    component: ChangePasswordComponent,
    canActivate: [ChangePasswordGuard]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { ChangePasswordComponent } from './user/self/change-password/change-password.component';
import { AddUserComponent } from './user/management/add-user/add-user.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { UserManagementComponent } from './user/management/user-management.component';
import { DataViewComponent } from './data-view/data-view.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {AllLoggedIn, NotAuthenticated, RequiredPasswordChange, RoleGuard} from './_auth/auth.guard';
import { AuthRedirectComponent } from './redirects/auth-redirect/auth-redirect.component';
import { LoginRedirectComponent } from './redirects/login-redirect/login-redirect.component';
import { EditUserComponent } from './user/management/edit-user/edit-user.component';
import {PlRole} from './_dto/user/pl-role.enum';


const routes: Routes = [
  {
    path: '',
    component: AuthRedirectComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AllLoggedIn]
  },
  {
    path: 'loginRedirect',
    component: LoginRedirectComponent
  },
  {
    path: 'dataView',
    component: DataViewComponent,
    canActivate: [AllLoggedIn]
  },
  {
    path: 'userManagement',
    component: UserManagementComponent,
    canActivate: [AllLoggedIn]
  },
  {
    path: 'userManagement/addUser',
    component: AddUserComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.USER_MANAGEMENT
    }
  },
  {
    path: 'createCard',
    component: CreateCardComponent,
    canActivate: [AllLoggedIn]
  },
  {
    path: 'userManagement/editUser/:username',
    component: EditUserComponent,
    canActivate: [AllLoggedIn]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthenticated]
  },
  {
    path: 'changePassword',
    component: ChangePasswordComponent,
    canActivate: [RequiredPasswordChange]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

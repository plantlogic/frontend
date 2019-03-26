import { ChangePasswordComponent } from './user/self/change-password/change-password.component';
import { AddUserComponent } from './user/management/add-user/add-user.component';
import { UserManagementComponent } from './user/management/user-management.component';
import { LoginComponent } from './user/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {AllLoggedIn, NotAuthenticated, RequiredPasswordChange, RoleGuard} from './_auth/auth.guard';
import { AuthRedirectComponent } from './redirects/auth-redirect/auth-redirect.component';
import { LoginRedirectComponent } from './redirects/login-redirect/login-redirect.component';
import { EditUserComponent } from './user/management/edit-user/edit-user.component';
import {PlRole} from './_dto/user/pl-role.enum';
import {EntryComponent} from './card/entry/entry.component';
import {CreateCardComponent} from './card/entry/create/create-card.component';


const routes: Routes = [
  // Redirects
  {
    path: '',
    component: AuthRedirectComponent,
  },
  {
    path: 'loginRedirect',
    component: LoginRedirectComponent
  },
  // Basic Functions
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
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AllLoggedIn]
  },
  // User Management
  {
    path: 'userManagement',
    component: UserManagementComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.USER_MANAGEMENT
    }
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
    path: 'userManagement/editUser/:username',
    component: EditUserComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.USER_MANAGEMENT
    }
  },
  // Card Entry
  {
    path: 'entry',
    component: EntryComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/#/',
    component: CreateCardComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/irrigation',
    component: CreateCardComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

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
import {OpenCardEntryComponent} from './card/entry/open/open-card-entry.component';
import {AddIrrigationComponent} from './card/entry/open/add-irrigation/add-irrigation.component';
import {AddTractorComponent} from './card/entry/open/add-tractor/add-tractor.component';
import {CloseCardComponent} from './card/entry/open/close/close-card.component';
import {ManagementComponent} from './card/management/management.component';
import {OpenCardComponent} from './card/management/open/open-card.component';
import {ExportComponent} from './card/management/export/export.component';
import {AdminComponent} from './card/admin/admin.component';


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
    path: 'entry/create',
    component: CreateCardComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/o/:id',
    component: OpenCardEntryComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/o/:id/add/irrigation',
    component: AddIrrigationComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/o/:id/add/tractor',
    component: AddTractorComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  {
    path: 'entry/o/:id/close',
    component: CloseCardComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_ENTRY
    }
  },
  // Card Management
  {
    path: 'manage',
    component: ManagementComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_VIEW
    }
  },
  {
    path: 'manage/o/:id',
    component: OpenCardComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_VIEW
    }
  },
  {
    path: 'manage/export',
    component: ExportComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.DATA_VIEW
    }
  },
  // App Administration
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: {
      role: PlRole.APP_ADMIN
    }
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

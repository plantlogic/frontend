import {ChangePasswordComponent} from './user/self/change-password/change-password.component';
import {AddUserComponent} from './user/management/add-user/add-user.component';
import {UserManagementComponent} from './user/management/user-management.component';
import {LoginComponent} from './user/login/login.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {AllLoggedIn, NotAuthenticated, RequiredPasswordChange, RoleGuard} from './_auth/auth.guard';
import {AuthRedirectComponent} from './redirects/auth-redirect/auth-redirect.component';
import {LoginRedirectComponent} from './redirects/login-redirect/login-redirect.component';
import {EditUserComponent} from './user/management/edit-user/edit-user.component';
import {PlRole} from './_dto/user/pl-role.enum';
import {EntryDashboardComponent} from './card/entry/entry-dashboard.component';
import {CreateCardEntryComponent} from './card/entry/create/create-card-entry.component';
import {OpenCardEntryComponent} from './card/entry/open/open-card-entry.component';
import {AddIrrigationEntryComponent} from './card/entry/open/add-irrigation/add-irrigation-entry.component';
import {AddTractorEntryComponent} from './card/entry/open/add-tractor/add-tractor-entry.component';
import {CloseCardEntryComponent} from './card/entry/open/close/close-card-entry.component';
import {CardManagementComponent} from './card/management/card-management.component';
import {OpenCardDataComponent} from './card/management/open/open-card-data.component';
import {ExportCardDataComponent} from './card/management/export/export-card-data.component';

import {CardContractorComponent} from './card/contractor/card-management.component';
import {OpenCardContractorComponent} from './card/contractor/open/open-card-data.component';

import {AppAdminComponent} from './card/admin/app-admin.component';
import {AddChemicalEntryComponent} from './card/entry/open/add-chemical/add-chemical-entry.component';


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
      role: [PlRole.USER_MANAGEMENT]
    }
  },
  {
    path: 'userManagement/addUser',
    component: AddUserComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/userManagement',
      role: [PlRole.USER_MANAGEMENT]
    }
  },
  {
    path: 'userManagement/editUser/:username',
    component: EditUserComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/userManagement',
      role: [PlRole.USER_MANAGEMENT]
    }
  },

  // Card Entry
  {
    path: 'entry',
    component: EntryDashboardComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/create',
    component: CreateCardEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/entry',
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/:saveFilter',
    component: EntryDashboardComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/o/:id',
    component: OpenCardEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/entry',
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/o/:id/add/irrigation',
    component: AddIrrigationEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '../../',
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/o/:id/add/tractor',
    component: AddTractorEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '../../',
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/o/:id/add/chemical',
    component: AddChemicalEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '../../',
      role: [PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'entry/o/:id/close',
    component: CloseCardEntryComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '../',
      role: [PlRole.DATA_ENTRY]
    }
  },

  // Card Management
  {
    path: 'manage',
    component: CardManagementComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.DATA_VIEW, PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'manage/o/:id',
    component: OpenCardDataComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/manage',
      role: [PlRole.DATA_VIEW, PlRole.DATA_ENTRY]
    }
  },
  {
    path: 'manage/export',
    component: ExportCardDataComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/manage',
      role: [PlRole.DATA_VIEW]
    }
  },
  {
    path: 'manage/:saveFilter',
    component: CardManagementComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.DATA_VIEW, PlRole.DATA_ENTRY]
    }
  },

  // Contractor Card Management
  {
    path: 'contractor',
    component: CardContractorComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.CONTRACTOR_VIEW]
    }
  },
  {
    path: 'contractor/:saveFilter',
    component: CardContractorComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.CONTRACTOR_VIEW]
    }
  },
  {
    path: 'contractor/o/:id',
    component: OpenCardContractorComponent,
    canActivate: [RoleGuard],
    data: {
      parent: '/contractor',
      role: [PlRole.CONTRACTOR_VIEW, PlRole.CONTRACTOR_EDIT]
    }
  },

  // App Administration
  {
    path: 'admin',
    component: AppAdminComponent,
    canActivate: [RoleGuard],
    data: {
      role: [PlRole.APP_ADMIN]
    }
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

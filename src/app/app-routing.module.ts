import { EdituserComponent } from './edituser/edituser.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DataViewComponent } from './data-view/data-view.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard, NotAuthGuard } from './_auth/auth.guard';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';


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
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

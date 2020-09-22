import { NgModule, Host, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from "./welcome/welcome.component";
import { HostComponent } from './host/host.component'
import { JoinComponent } from "./join/join.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { GameviewComponent } from "./gameview/gameview.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path: '', 
  redirectTo: '/welcome', 
  pathMatch: 'full'},

  {path: 'welcome', 
  component: WelcomeComponent},

  {path: 'login', 
  component: LoginComponent},

  {path: 'login/register', 
  component: RegisterComponent},

  {path: 'host', 
  component: HostComponent, 
  canActivate: [AuthGuard]
  },

  {path: 'join/:id', 
  component: JoinComponent,
  canActivate: [AuthGuard]
  },

  {path: 'gameview', 
  component: GameviewComponent,
  canActivate: [AuthGuard]
  },

  {path: '**', 
  component: PageNotFoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

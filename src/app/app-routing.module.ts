import { NgModule, Host, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from "./welcome/welcome.component";
import { HostComponent } from './host/host.component'
import { JoinComponent } from "./join/join.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { GameviewComponent } from "./gameview/gameview.component";

const routes: Routes = [
  {path: '', redirectTo: '/welcome', pathMatch: 'full'},
  {path: 'welcome', component: WelcomeComponent},
  {path: 'host', component: HostComponent},
  {path: 'join', component: JoinComponent},
  {path: 'gameview', component: GameviewComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

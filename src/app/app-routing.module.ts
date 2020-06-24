import { NgModule, Host, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HostComponent } from './host/host.component'
import { JoinComponent } from "./join/join.component";
import { WelcomeComponent } from "./welcome/welcome.component";

const routes: Routes = [
  {
    path:'host',
    component: HostComponent
  },
  {
    path:'join',
    component: JoinComponent
  },
  {
    path:'welcome',
    component: WelcomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

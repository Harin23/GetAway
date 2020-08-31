import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  username = "";
  constructor(
    private _app: AppComponent,
    private _router: Router,
    //private chat: ChatService
  ) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
  }



}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as io from "socket.io-client";

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit {

  @ViewChild("game")
  private gameC: ElementRef;

  private context: any;
  private socket: any;

  constructor() { }

  ngOnInit() {
    this.socket = io("http://localhost:3000");
  }

  ngAfterViewInit(){
    this.context = this.gameC.nativeElement.getContext("2d");
    this.socket.on("position", position => {
      this.context.clearRect(
        0, 
        0,
        this.gameC.nativeElement.width,
        this.gameC.nativeElement.height
      );
      this.context.fillRect(position.x,position.y,20,20);
    });
  }

  move(direction: string){
    this.socket.emit("move", direction);
  }

}

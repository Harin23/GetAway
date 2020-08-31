import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit {




  constructor() { }

  ngOnInit() {
    
  }

  move(direction: string){
    console.log("move: " + direction)
  };

}

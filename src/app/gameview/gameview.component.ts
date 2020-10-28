import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit, AfterViewInit {

  canvasHeight = window.innerHeight - 74;
  canvasWidth = window.innerWidth*0.992;

  

  constructor() { }

  ngOnInit() {
    //console.log(window.innerHeight - 74)
    //console.log(window.innerWidth*0.992)
  }

  ngAfterViewInit(){
    let gamecanvas = document.getElementById('gamecanvas') as  HTMLCanvasElement;
    let gcCTX = gamecanvas.getContext("2d");

    //rectange of the table
    let wr = this.canvasWidth*0.5;
    let hr = this.canvasHeight*0.6;
    let xr = (this.canvasWidth*0.5) - (0.5*wr);
    let yr = (this.canvasHeight*0.5) - (0.5*hr);
    gcCTX.fillRect(xr,yr,wr,hr);

    //semi-circles of table
    let r = hr*0.5;
    let yc = yr + (0.5*hr);
    let xc1 = xr;
    gcCTX.arc(xc1,yc,r,0.5*Math.PI,1.5*Math.PI);
    gcCTX.fillStyle = "RGB(53,101,77)"
    gcCTX.fill();
    let xc2 = xr + wr;
    gcCTX.arc(xc2,yc,r,1.5*Math.PI,0.5*Math.PI);
    gcCTX.fill();

    //card on the table
    

  }
}

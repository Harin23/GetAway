import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit, AfterViewInit {

  canvasHeight = window.innerHeight - 74;
  canvasWidth = window.innerWidth*0.992;

  username = localStorage.getItem('username')
  timer = 5;
  
  clubs = ["AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC"];
  hearts = ["AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH"];
  diamonds = ["AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];
  spades = ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS"];

  constructor(
    private game: GameService
  ) { }

  ngOnInit() {
    //console.log(window.innerHeight - 74)
    //console.log(window.innerWidth*0.992)
    console.log("game init")
    this.game.start(sessionStorage.getItem('room')).subscribe(
      res=>{console.log(res)},
      err=>{console.log(err)}
    )
  }

  ngAfterViewInit(){
    const gamecanvas = document.getElementById('gamecanvas') as  HTMLCanvasElement;
    const gcCTX = gamecanvas.getContext("2d");

    //rectange of the table
    const wr = this.canvasWidth*0.3;
    const hr = this.canvasHeight*0.4;
    const xr = (this.canvasWidth*0.5) - (0.5*wr);
    const yr = (this.canvasHeight*0.5) - (0.5*hr);
    gcCTX.fillRect(xr,yr,wr,hr);

    //semi-circles of table
    const r = hr*0.5;
    const yc = yr + (0.5*hr);
    const xc1 = xr;
    gcCTX.arc(xc1,yc,r,0.5*Math.PI,1.5*Math.PI);
    gcCTX.fillStyle = "RGB(53,101,77)"
    gcCTX.fill();
    const xc2 = xr + wr;
    gcCTX.arc(xc2,yc,r,1.5*Math.PI,0.5*Math.PI);
    gcCTX.fill();

    //card thrown on the table
    const dwCard = r;
    const dhCard = hr*0.7;
    const dxCard = ((xc1+xc2)*0.5)-(0.5*dwCard);
    const dyCard = yr + (hr - dhCard)*0.5
    let cardImage = new Image()
    cardImage.src = "../../assets/PNG/2C.png"
    //console.log(cardImage)
    cardImage.onload = ()=>{
      gcCTX.drawImage(cardImage, dxCard, dyCard, dwCard, dhCard)
    }
    //getaway text
    const maxWidthText = dxCard - xc1;
    const yText = yc*1.05;
    const xText1 = xc1;
    gcCTX.font = "100px Arial bolder"
    gcCTX.fillStyle = "rgb(128, 0, 0)"
    gcCTX.fillText("GET", xText1, yText, maxWidthText)
    const xText2 = dxCard + dwCard;
    gcCTX.fillText("AWAY!", xText2, yText, maxWidthText)
    /*
    //top texts
    const yTopTexts = yr - 40;
    //Current turn
    var turnText = "CURRENT TURN: " + this.username
    gcCTX.font = "50px Arial bolder"
    gcCTX.fillStyle = "black"
    gcCTX.fillText(turnText, 0, yTopTexts)
    //timer
    var timerString = "TIME LEFT: " + this.timer.toString()
    //console.log(timerString)
    gcCTX.font = "50px Arial bolder"
    gcCTX.fillStyle = "black"
    gcCTX.fillText(timerString, xc2, yTopTexts)
    */
  }

}

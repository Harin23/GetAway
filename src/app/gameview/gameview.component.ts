import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { GameService } from '../game.service';
import { LobbyService } from '../lobby.service';

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit, AfterViewInit {

  canvasHeight = 0;
  canvasWidth = 0;
  navbarHeight=0;
  wr=0; hr=0; xr=0; yr=0; r=0; yc=0; xc1=0; xc2=0;
  dyUserCards=0; dhUserCards=0; dwUserCards=0; dxUserCards = {};
  dwCard=0; dhCard=0; dxCard=0; dyCard=0;

  subscription1$: Subscription;

  constructor(
    private game: GameService,
    private auth: AuthService,
    private lobby: LobbyService,
    private app: AppComponent
  ) { }

  getCanvas(){
    let gamecanvas = document.getElementById('gamecanvas') as  HTMLCanvasElement;
    return gamecanvas;
  }

  getCanvasContext(){
    let gamecanvas = document.getElementById('gamecanvas') as  HTMLCanvasElement;
    let gcCTX = gamecanvas.getContext("2d");
    return gcCTX;
  }

  setVariables(){
    this.navbarHeight = this.app.getNavbar().height;
    this.canvasHeight = window.innerHeight - this.navbarHeight;
    this.canvasWidth = window.innerWidth;
    this.wr = this.canvasWidth*0.3;
    this.hr = this.canvasHeight*0.4;
    this.xr = (this.canvasWidth*0.5) - (0.5*this.wr);
    this.yr = (this.canvasHeight*0.5) - (0.5*this.hr);
  
    this.r = this.hr*0.5;
    this.yc = this.yr + (0.5*this.hr);
    this.xc1 = this.xr;
    this.xc2 = this.xr + this.wr;

    this.dyUserCards = this.yr + (this.hr * 1.1);
    this.dhUserCards = this.canvasHeight - this.dyUserCards;
    this.dwUserCards = this.canvasWidth / 13;

    this.dwCard = this.r;
    this.dhCard = this.hr*0.7;
    this.dxCard = ((this.xc1+this.xc2)*0.5)-(0.5*this.dwCard);
    this.dyCard = this.yr + (this.hr - this.dhCard)*0.5
  
  }

  ngOnInit() {
    this.setVariables()
    this.subscription1$ = this.game.listen("tableCard").subscribe((data) => this.placeCardOnTable(data));
  }

  removeCardFromUsersDeck(x: Array<number>){
    let gcCTX = this.getCanvasContext();
    gcCTX.fillRect(x[0], this.dyUserCards, this.dwUserCards, this.dhUserCards)
  }

  placeCardOnTable(card: string){
    let gcCTX = this.getCanvasContext();
    let img = this.game.getCardImage(card)
    img.onload = () =>{
      gcCTX.drawImage(img, this.dxCard, this.dyCard, this.dwCard, this.dhCard)
    }
  }

  ngAfterViewInit(){
    let gcCTX = this.getCanvasContext();

    //rectange of the table

    gcCTX.fillRect(this.xr,this.yr,this.wr,this.hr);

    //semi-circles of table
    gcCTX.arc(this.xc1,this.yc,this.r,0.5*Math.PI,1.5*Math.PI);
    gcCTX.fillStyle = "RGB(53,101,77)"
    gcCTX.fill();
    
    gcCTX.arc(this.xc2,this.yc,this.r,1.5*Math.PI,0.5*Math.PI);
    gcCTX.fill();

    //outline for card thrown on the table:
    const dwCardOutline = this.dwCard+10;
    const dhCardOutline = this.dhCard+10;
    const dxCardOutline = ((this.xc1+this.xc2)*0.5)-(0.5*dwCardOutline);
    const dyCardOutline = this.yr + (this.hr - dhCardOutline)*0.5;
    gcCTX.fillStyle = "rgb(128, 0, 0)"
    gcCTX.fillRect(dxCardOutline,dyCardOutline,dwCardOutline,dhCardOutline);

    //getaway text
    const maxWidthText = dxCardOutline - this.xc1;
    const yText = this.yc*1.05;
    const xText1 = this.xc1;
    gcCTX.font = "100px Arial bolder"
    gcCTX.fillStyle = "rgb(128, 0, 0)"
    gcCTX.fillText("GET", xText1, yText, maxWidthText)
    const xText2 = dxCardOutline + dwCardOutline;
    gcCTX.fillText("AWAY!", xText2, yText, maxWidthText)
    //the users cards:
    this.auth.fetchUsername().subscribe(
      res =>{
        let username = res['collectedUsername'];
        this.lobby.findRoom(username).subscribe(
          res=>{
            let room = res['data'].room;
            this.game.getCards(room, username).subscribe(
              res=>{
                console.log(res)
                let assignedDeck = res["assignedDeck"];
                for(let i=0; i<assignedDeck.length; i++){
                  let img = this.game.getCardImage(assignedDeck[i]);
                    let dx = this.dwUserCards * i;
                    this.dxUserCards[assignedDeck[i]] = [dx, dx + this.dwUserCards]
                    img.onload = () =>{
                      gcCTX.drawImage(img, dx, this.dyUserCards, this.dwUserCards, this.dhUserCards)
                    };
                }
              },
              err=>{console.log(err)}
            )
            this.game.getOnTable({room: room}).subscribe(
              res=>{this.placeCardOnTable(res["cardOnTable"])},
              err=>{console.log(err)}
            )
          },
          err=>{console.log(err)}
        )
      })

      let gamecanvas = this.getCanvas();
      gamecanvas.addEventListener("click", (e)=>{
        this.throwCard(e)
      })

    /*
    //top texts
    const yTopTexts = this.yr - 40;
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
    gcCTX.fillText(timerString, this.xc2, yTopTexts)
    */
  }

  findClickedCard(clicked: { x: any; y: any; }){
    //console.log(clicked.y, this.dyUserCards, this.dyUserCards+this.dhUserCards)
    if(clicked.y<this.dyUserCards+this.navbarHeight || clicked.y>this.dyUserCards+this.dhUserCards+this.navbarHeight){
      return {selectionMade: false, cardSelected: null, location: null}
    }
    let result = {selectionMade: false, cardSelected: null, location: null};
    let keys = Object.keys(this.dxUserCards)
    for(let i=0; i<keys.length; i++){
      if(clicked.x >= this.dxUserCards[keys[i]][0] && clicked.x <= this.dxUserCards[keys[i]][1]){
        result.selectionMade = true;
        result.cardSelected = keys[i]
        result.location = [this.dxUserCards[keys[i]][0], this.dxUserCards[keys[i]][1]]
        delete this.dxUserCards[keys[i]]
        break;
      }
    }
    return result;
  }

  throwCard(e: MouseEvent){
    //card thrown on the table
    let clicked = {x:e.x, y:e.y}
    let selection = this.findClickedCard(clicked);

    if(selection.selectionMade === true){
      this.auth.fetchUsername().subscribe(
        res =>{
          let username = res['collectedUsername'];
          this.lobby.findRoom(username).subscribe(
            res=>{
              let room = res['data'].room;
              let data = {room: room, name: username, card: selection.cardSelected}
              this.game.throwCard(data).subscribe(
                res=>{
                  if(res["thrown"] === true){
                    // this.placeCardOnTable(selection.cardSelected);
                    this.removeCardFromUsersDeck(selection.location);
                    this.game.onTable(data)
                  }else{
                    console.log("failed to throw card")
                  }
                },
                err=>{console.log(err)}
              )
            },
            err=>{console.log(err)}
          )
        })
    }
  }

  ngOnDestroy(): void{
    this.subscription1$.unsubscribe();
  }
}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-gameview',
  templateUrl: './gameview.component.html',
  styleUrls: ['./gameview.component.css']
})
export class GameviewComponent implements OnInit, AfterViewInit {

  canvasHeight = 0;
  canvasWidth = 0;
  navbarHeight=0;
  fontSize = 0;
  wr=0; hr=0; xr=0; yr=0; r=0; yc=0; xc1=0; xc2=0;
  dyUserCards=0; dhUserCards=0; dwUserCards=0; dxUserCards = {};
  dwCard=0; dhCard=0; dxCard=0; dyCard=0;
  OtherUsersNamesX = []; otherUsersNamesY = []; OtherUsersNamesTextWidth=0;

  subscription1$: Subscription;

  constructor(
    private game: GameService,
    private router: Router,
    private app: AppComponent,
    private auth: AuthService
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
    this.dyCard = this.yr + (this.hr - this.dhCard)*0.5;

    this.OtherUsersNamesTextWidth=this.xr - this.r;
    this.OtherUsersNamesX[0] = 0;
    this.OtherUsersNamesX[1] = ((this.xr + this.xc2)/2) - (this.OtherUsersNamesTextWidth/2);
    this.OtherUsersNamesX[2] = this.xc2 + this.r;
    this.otherUsersNamesY[0] = this.yr+this.navbarHeight;
    this.otherUsersNamesY[1] = this.navbarHeight+10;
    this.otherUsersNamesY[2] = this.yr+this.navbarHeight;
    this.fontSize = this.canvasHeight*0.1;
  }

  drawTable(){
    let gcCTX = this.getCanvasContext();

    gcCTX.clearRect(0, 0, this.canvasHeight, this.canvasHeight);

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
    gcCTX.font = (this.fontSize*1.4) + "px" +" Arial bolder"
    gcCTX.fillStyle = "rgb(128, 0, 0)"
    gcCTX.fillText("GET", xText1, yText, maxWidthText)
    const xText2 = dxCardOutline + dwCardOutline;
    gcCTX.fillText("AWAY!", xText2, yText, maxWidthText)
  }

  displayDeck(assignedDeck: Array<string>){
    let gcCTX = this.getCanvasContext();
    gcCTX.fillStyle = "lightsteelblue"
    gcCTX.fillRect(0, this.dyUserCards, this.canvasWidth, this.dhUserCards);
    for(let i=0; i<assignedDeck.length; i++){
      let img = this.game.getCardImage(assignedDeck[i]);
        let dx = this.dwUserCards * i;
        this.dxUserCards[assignedDeck[i]] = [dx, dx + this.dwUserCards]
        img.onload = () =>{
          gcCTX.drawImage(img, dx, this.dyUserCards, this.dwUserCards, this.dhUserCards)
        };
    }
  }

  placeCardOnTable(card: string){
    let gcCTX = this.getCanvasContext();
    let img = this.game.getCardImage(card)
    img.onload = () =>{
      gcCTX.drawImage(img, this.dxCard, this.dyCard, this.dwCard, this.dhCard)
    }
  }

  displayOtherUsers(otherUsers: string | any[]){
    let gcCTX = this.getCanvasContext();
    for(let i=0; i<otherUsers.length; i++){
      //console.log(otherUsers[keys[i]], this.OtherUsersNamesX[i], this.otherUsersNamesY[i], this.OtherUsersNamesTextWidth)
      gcCTX.fillStyle = "lightsteelblue"
      gcCTX.fillRect(this.OtherUsersNamesX[i],this.otherUsersNamesY[i],this.OtherUsersNamesTextWidth,this.fontSize*2);

      gcCTX.font = this.fontSize + "px" + " Arial bolder"
      gcCTX.fillStyle = "blue"
      gcCTX.fillText(otherUsers[i]["user"]+":", this.OtherUsersNamesX[i], this.otherUsersNamesY[i], this.OtherUsersNamesTextWidth)

      gcCTX.font = this.fontSize + "px" + " Arial bolder"
      gcCTX.fillStyle = "blue"
      gcCTX.fillText(otherUsers[i]["deck"], this.OtherUsersNamesX[i], this.otherUsersNamesY[i]+this.fontSize, this.OtherUsersNamesTextWidth)
    }
  }

  displayCurrentTurn(turn: string){
    let gcCTX = this.getCanvasContext();

    gcCTX.fillStyle = "lightsteelblue"
    gcCTX.fillRect(0, 0,this.OtherUsersNamesTextWidth,this.fontSize);

    gcCTX.font = (this.fontSize*0.75) + "px" + " Arial bolder"
    gcCTX.fillStyle = "black"
    gcCTX.fillText("Turn: "+turn, 0, this.navbarHeight+20, this.OtherUsersNamesTextWidth)
  }

  gameOverDisplay(loser: string){
    let gcCTX = this.getCanvasContext();
    gcCTX.clearRect(0, 0, this.canvasHeight, this.canvasHeight);

    gcCTX.font = (this.fontSize*3) + "px" + " Arial bolder"
    gcCTX.fillStyle = "black"
    gcCTX.fillText(loser+" IS THE LOSER!!!", 0, (this.fontSize*3), this.canvasWidth-10)

    gcCTX.fillRect((this.canvasWidth/2)-(this.wr/2), this.canvasHeight/2,this.wr/2,this.hr/2)
    gcCTX.font = this.fontSize + "px" + " Arial bolder"
    gcCTX.fillStyle = "white"
    gcCTX.fillText("Play Again", (this.canvasWidth/2)-(this.wr/2), (this.canvasHeight/2)+this.fontSize, this.wr/2)
  }

  ngOnInit() {
    this.app.UserAlreadySignedIn();
    this.setVariables();
    this.auth.getUserInfo().subscribe(
      res=>{
        this.game.joinRoom(res["room"]);
      },
      err=>{console.log(err)}
    );
  }

  ngAfterViewInit(){     
    //the users cards:
    this.game.getGameInfo().subscribe(
      res=>{
        console.log(res)
        let gameover = res["gameover"]
        if(gameover === false){
          this.drawTable();
          this.placeCardOnTable(res["cardOnTable"]);
          this.displayDeck(res["assignedDeck"]);
          this.displayOtherUsers(res["otherUsers"]);
          this.displayCurrentTurn(res["currentTurn"])
          this.subscription1$ = this.game.listen("cardThrown").subscribe((data) => this.cardThrown(data));
          let gamecanvas = this.getCanvas();
          gamecanvas.addEventListener("click", (e)=>{
            this.throwCard(e);
          })
        }else{
          this.gameOverDisplay(res["loser"]);
        }    
      },
      err=>{
        console.log(err)
      }
    )         
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
      let data = {card: selection.cardSelected}
      this.game.throwCard(data).subscribe(
        res=>{
            delete this.dxUserCards[selection.cardSelected];
            data["room"] = res["room"];
            this.game.onTable(data);
        },
        err=>{console.log(err)}
      )  
    }
  }

  cardThrown(data: any){
    let card = data.card
    this.placeCardOnTable(card);
    this.game.getGameInfo().subscribe(
      res=>{
        let gameover = res["gameover"]
        if(gameover === false){
          this.displayDeck(res["assignedDeck"]);
          this.displayOtherUsers(res["otherUsers"]);
          this.displayCurrentTurn(res["currentTurn"]);
        }else{
          this.gameOverDisplay(res["loser"])
        }
      },
      err=>{console.log(err)}
    )
  }

  // playAgain(e: MouseEvent){
  //   if(e.x > this.canvasWidth/2 && e.x < (this.canvasWidth/2)+this.wr/2){
  //     if(e.y > this.canvasHeight/2 && e.y < (this.canvasHeight/2)+this.hr/2){
  //       this.game.shuffle().subscribe(
  //         res=>{
  //           if(res["shuffled"] === true){
  //             this.game.getGameInfo().subscribe(
  //               res=>{
  //                 this.drawTable();
  //                 this.placeCardOnTable(res["cardOnTable"]);
  //                 this.displayDeck(res["assignedDeck"]);
  //                 this.displayOtherUsers(res["otherUsers"]);
  //                 this.game.joinRoom(res["roomReq"]);
  //                 let gamecanvas = this.getCanvas();
  //                 gamecanvas.removeEventListener("click", this.playAgain)
  //                 gamecanvas.addEventListener("click", this.throwCard)   
  //               },
  //               err=>{
  //                 console.log(err)
  //               }
  //             ) 
  //           }        
  //         },
  //           err=>{console.log(err)}
  //       )
  //     }
  //   }
  // }

  ngOnDestroy(): void{
    this.subscription1$.unsubscribe();
  }
}

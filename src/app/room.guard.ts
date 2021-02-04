import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LobbyService } from './lobby.service';


@Injectable({
  providedIn: 'root'
})
export class RoomGuard implements CanActivate {

  constructor(private lobby: LobbyService,
    private router: Router) {}

  canActivate(): boolean {
    if (this.lobby.userInRoom()) {
      console.log("room guard not activated")
      return true;
    } else {
      this.router.navigate(['/host']);
      window.alert("Join a room first.")
      return false;
    }
  }
  
}

import { Component, EventEmitter, Output } from '@angular/core';
import { RiotService } from '../../services/riot.service';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  name: string = '';
  tag: string = '';
  server: string = 'br1';  
  matchId: string = '';

  @Output() cardLoaded = new EventEmitter<Card>();

  constructor(private riotService: RiotService) {}

  async buscarCarta(): Promise<void> {
    if (!this.name || !this.tag || !this.server) return;
    
    try {
      const account = await this.riotService.getAccountByRiotId(this.name, this.tag, this.server);
      let card: Card | undefined;

      if (this.matchId && this.matchId.trim() !== '') {
        card = await this.riotService.getSpecificMatchDetails(account.puuid, this.server, this.matchId);
      } else {
        card = await this.riotService.getLatestMatchDetails(account.puuid, this.server);
      } 

      if(card){
        this.cardLoaded.emit(card);
      } else {
        console.error('carta nao encontrada');
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados da carta:', error);
    }
  }
}

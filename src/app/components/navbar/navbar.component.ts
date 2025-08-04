import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { RiotService } from '../../services/riot.service';
import { Card } from '../../models/card.model';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CardStateService } from '../../services/card-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  name: string = '';
  tag: string = '';
  server: string = 'br1';  
  matchId: string = '';

  cardElement!: HTMLElement;
  @Output() cardLoaded = new EventEmitter<Card>();

  private destroy$ = new Subject<void>();

  constructor(private riotService: RiotService,
    public auth: AuthService,
    private router: Router,
    private cardState: CardStateService,
  ) {}

  ngOnInit(): void {
    this.cardState.cardElement$
     .pipe(takeUntil(this.destroy$))
     .subscribe(element => {
      console.log('Card element received:', element);
      this.cardElement = element as HTMLElement});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.auth.clearToken(); 
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

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
        this.cardState.setCard(card);
      } else {
        console.error('carta nao encontrada');
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados da carta:', error);
    } 
  }

  salvarImagem(): void {
    
    console.log('Botão de salvar clicado'); 

    if (this.cardElement) {
      this.cardState.setCardElement(this.cardElement); 

      if (!this.cardElement) {
        console.warn('Carta não encontrada!');
        return;
      }

      const inner = this.cardElement.querySelector('.flip-inner');
      if (!inner) return;
      
      const back = this.cardElement.querySelector('.flip-back');
      if (!back) return;

      const isFlipped = inner?.classList.contains('rotate-y-180');
  
      inner?.classList.remove('rotate-y-180');
      inner && ((inner as HTMLElement).style.transform = 'none');
      back && ((back as HTMLElement).style.visibility = 'hidden');
      
  
      setTimeout(() => {
        html2canvas(this.cardElement!, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
        }).then(canvas => { 
          if (isFlipped) {
            inner?.classList.add('rotate-y-180');
            inner && ((inner as HTMLElement).style.transform = '');
          }
          back && ((back as HTMLElement).style.visibility = '');
  
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = 'carta-jogador.png';
          a.click();
        });
      }, 500);
    }
  }
  
}

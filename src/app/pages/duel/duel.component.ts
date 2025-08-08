import { Component, OnInit, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../services/auth.service';
import { Card } from '../../models/card.model';
import { DuelService } from '../../services/duel.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.css'],
})
export class DuelComponent implements OnInit, OnDestroy {
   
  statusMessage = '';
  currentDeck: Card[] = [];
  selectedCard: Card | null = null;
  inQueue = false;
  inMatch = false;
  opponent: string | null = null;

  // roomId: string | null = null;

  myCardPlayed: Card | null = null;
  opponentCardPlayed: Card | null = null;
  roundResult: string | null = null;

  private subs: Subscription[] = [];

  constructor(private duelService: DuelService) {}

  ngOnInit() { 
    this.duelService.connect();
    
    this.subs.push(
      this.duelService.statusMessage$.subscribe(msg => this.statusMessage = msg),
      this.duelService.currentDeck$.subscribe(deck => this.currentDeck = deck),
      this.duelService.selectedCard$.subscribe(card => this.selectedCard = card),
      this.duelService.inQueue$.subscribe(flag => this.inQueue = flag),
      this.duelService.inMatch$.subscribe(flag => this.inMatch = flag),
      this.duelService.opponent$.subscribe(op => this.opponent = op), 
      this.duelService.myCardPlayed$.subscribe(card => this.myCardPlayed = card),
      this.duelService.opponentCardPlayed$.subscribe(card => this.opponentCardPlayed = card),
      this.duelService.roundResult$.subscribe(res => this.roundResult = res),
    )
  }

  ngOnDestroy() { 
    this.subs.forEach(sub => sub.unsubscribe());
    this.duelService.disconnect();
  }

  joinQueue(): void { 
    this.duelService.joinQueue();
  }

  leaveQueue(): void { 
    this.duelService.leaveQueue();
  }

  playCard(card: Card): void { 
    this.duelService.playCard(card);
  }

}

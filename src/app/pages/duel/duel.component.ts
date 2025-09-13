import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { Card } from '../../models/card.model';
import { DuelService } from '../../services/duel/duel.service';
import { DuelStateService, RoundResultPayload } from '../../services/duel/duel-state.service';

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
  myCardPlayed: Card | null = null;
  opponentCardPlayed: Card | null = null;
  roundResult: string | null = null;
  roundPhase: 'selection' | 'waiting' | 'result' | 'done' | 'idle' = 'idle';
  roundHistory: RoundResultPayload[] = [];
  duelFinished = false;

  private subs: Subscription[] = [];

  constructor(
    private duelService: DuelService,
    private duelState: DuelStateService
  ) {}

  ngOnInit() {
    this.duelService.resetState();
    this.duelService.connect();
    this.initializeSubscriptions();
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
    if (!this.inMatch || !card || this.roundPhase !== 'selection') return;
    this.selectedCard = card;
    this.roundPhase = 'waiting';
    this.duelService.playCard(card);
  }

  startNextRound(): void {
    this.resetRoundState();
    this.roundPhase = 'selection';
    this.statusMessage = 'Nova rodada. Escolha sua carta!';
  }

  finalizeStats(): void {
    this.resetMatchState();
    this.duelService.resetState();
    this.statusMessage = 'Jogue novamente.';
    this.duelService.leaveQueue();
  }

  lastRound(): RoundResultPayload | null {
    return this.roundHistory.length ? this.roundHistory[this.roundHistory.length - 1] : null;
  }

  private initializeSubscriptions(): void {
    this.subs.push(
      this.duelState.statusMessage$.subscribe(msg => this.statusMessage = msg),
      this.duelState.currentDeck$.subscribe(deck => this.currentDeck = deck),
      this.duelState.selectedCard$.subscribe(card => this.selectedCard = card),
      this.duelState.inQueue$.subscribe(flag => this.inQueue = flag),
      this.duelState.inMatch$.subscribe(flag => this.handleMatchStart(flag)),
      this.duelState.opponent$.subscribe(op => this.opponent = op),
      this.duelState.myCardPlayed$.subscribe(card => this.myCardPlayed = card),
      this.duelState.opponentCardPlayed$.subscribe(card => this.opponentCardPlayed = card),
      this.duelState.roundPhase$.subscribe(phase => this.roundPhase = phase),
      this.duelState.roundResultPayload$
        .pipe(filter((p): p is RoundResultPayload => p !== null))
        .subscribe(payload => this.handleRoundResult(payload)),
      this.duelState.duelEnded$.subscribe(data => {
        if(!data) return;
        this.handleDuelEnd(data.winner) 
      })
    );
  }

  private handleMatchStart(flag: boolean): void {
    this.inMatch = flag;
    if (flag) {
      this.startSelectionPhase();
      this.roundHistory = [];
      this.duelFinished = false;
    }
  }

  private handleRoundResult(payload: RoundResultPayload): void {
    this.roundPhase = 'result';
    this.myCardPlayed = payload.myCard;
    this.opponentCardPlayed = payload.opponentCard;
    this.roundResult = payload.result;
    this.roundHistory.push(payload);
    this.statusMessage = `Resultado da rodada: ${payload.result}`;
    if (this.roundHistory.length === 3) this.duelFinished = true;
  }

  private handleDuelEnd(winner: 'me' | 'opponent' | 'draw'): void {
    this.duelFinished = true;
    this.roundPhase = 'result';
    this.inMatch = false;
    const messages = {
      me: 'Você venceu o duelo!',
      opponent: 'Você perdeu o duelo!',
      draw: 'O duelo terminou empatado!'
    };
    this.statusMessage = messages[winner];
  }

  private startSelectionPhase(): void {
    this.resetRoundState();
    this.roundPhase = 'selection';
  }

  private resetRoundState(): void {
    this.selectedCard = null;
    this.myCardPlayed = null;
    this.opponentCardPlayed = null;
    this.roundResult = null;
  }

  private resetMatchState(): void {
    this.duelFinished = false;
    this.roundPhase = 'done';
    this.inMatch = false;
    this.roundHistory = [];
    this.resetRoundState();
  }
}
 
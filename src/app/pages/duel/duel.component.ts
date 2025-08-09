import { Component, OnInit, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../services/auth.service';
import { Card } from '../../models/card.model';
import { DuelService } from '../../services/duel.service';
import { filter, Subscription } from 'rxjs';
import { RoundResultPayload } from '../../services/duel.service';

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

  roundPhase: 'selection' | 'waiting' | 'result' | 'done' = 'selection';
  // roundHistory: { myCard: Card; opponentCard: Card; result: string }[] = [];

  roundHistory: RoundResultPayload[] = [];

  duelFinished = false;

  private subs: Subscription[] = [];

  constructor(private duelService: DuelService) {}

  ngOnInit() {
    this.duelService.connect();

    let deckReady = false;
    let matchStarted = false;

    this.subs.push(
      this.duelService.statusMessage$.subscribe((message) => {
        // if (this.roundPhase === 'result') return;
        this.statusMessage = message;
      }),

      this.duelService.currentDeck$.subscribe((deck) => {
        this.currentDeck = deck;
        // deckReady = deck.length >= 1;

        // if (matchStarted && deckReady && this.roundPhase !== 'result') {
        //   this.startSelectionPhase();
        // }
      }),

      this.duelService.selectedCard$.subscribe(
        (card) => (this.selectedCard = card)
      ),

      this.duelService.inQueue$.subscribe((flag) => (this.inQueue = flag)),

      this.duelService.inMatch$.subscribe((flag) => {
        this.inMatch = flag;
        if (flag) {
          this.startSelectionPhase();
          this.roundHistory = [];
          this.duelFinished = false;
        }
      }),

      this.duelService.opponent$.subscribe((op) => (this.opponent = op)),

      this.duelService.myCardPlayed$.subscribe(
        (card) => (this.myCardPlayed = card)
      ),

      this.duelService.opponentCardPlayed$.subscribe(
        (card) => (this.opponentCardPlayed = card)
      ),
      // this.duelService.roundResult$
      //   .pipe(filter((res): res is string => res !== null))
      //   .subscribe((res) => {
      //     this.roundResult = res;
      //     this.roundPhase = 'result';

      //     this.roundHistory.push({
      //       myCard: this.myCardPlayed!,
      //       opponentCard: this.opponentCardPlayed!,
      //       result: this.roundResult!,
      //     });

      //     console.log('Round history:', this.roundHistory);
      //   }),
      this.duelService.roundResultPayload$
        .pipe(
          filter((payload): payload is RoundResultPayload => payload !== null)
        )
        .subscribe((payload) => {
          this.roundPhase = 'result';

          this.myCardPlayed = payload.myCard;
          this.opponentCardPlayed = payload.opponentCard;
          this.roundResult = payload.result;

          this.roundHistory.push(payload);

          this.statusMessage = `Resultado da rodada: ${payload.result}`;

          if (this.roundHistory.length === 3) this.duelFinished = true;
        }),

      this.duelService.duelEnded$.subscribe((data) => {
        this.duelFinished = true;
        this.roundPhase = 'result';
        this.inMatch = false;

        switch (data.winner) {
          case 'me':
            this.statusMessage = 'Você venceu o duelo!';
            break;
          case 'opponent':
            this.statusMessage = 'Você perdeu o duelo!';
            break;
          case 'draw':
            this.statusMessage = 'O duelo terminou empatado!';
            break;
        }
      })
    );
  }

  lastRound() {
    if (!this.roundHistory || this.roundHistory.length === 0) return null;
    return this.roundHistory[this.roundHistory.length - 1];
  }

  finalizeStats(): void {
    this.duelFinished = false;
    this.roundPhase = 'done';
    this.inMatch = false;
    this.statusMessage = 'Jogue novamente.';
    this.roundHistory = [];
    this.selectedCard = null;
    this.myCardPlayed = null;
    this.opponentCardPlayed = null;
    this.roundResult = null;

    this.duelService.leaveQueue();
  }

  startSelectionPhase() {
    this.roundPhase = 'selection';
    // this.roundHistory = [];
    this.myCardPlayed = null;
    this.opponentCardPlayed = null;
    this.roundResult = null;
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
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
    this.selectedCard = null;
    this.myCardPlayed = null;
    this.opponentCardPlayed = null;
    this.roundResult = null;

    this.roundPhase = 'selection';
    this.statusMessage = 'Nova rodada. Escolha sua carta!';
  }
}

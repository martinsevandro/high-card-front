import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class DuelService {
  private socket!: Socket;

  statusMessage$ = new BehaviorSubject<string>('Desconectado');
  inQueue$ = new BehaviorSubject<boolean>(false);
  inMatch$ = new BehaviorSubject<boolean>(false);
  currentDeck$ = new BehaviorSubject<Card[]>([]);
  selectedCard$ = new BehaviorSubject<Card | null>(null);
  opponent$ = new BehaviorSubject<string | null>(null);
  myCardPlayed$ = new BehaviorSubject<Card | null>(null);
  opponentCardPlayed$ = new BehaviorSubject<Card | null>(null);
  roundResult$ = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  connect(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.statusMessage$.next('Token JWT não encontrado. Faça login.');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.statusMessage$.next('Conectado');
    });

    this.socket.on('waiting_for_opponent', () => {
      this.inQueue$.next(true);
      this.statusMessage$.next('Aguardando oponente...');
    });

    this.socket.on('insuficient_deck', () => {
      this.statusMessage$.next('Você precisa de pelo menos 10 cartas.');
    });

    this.socket.on('duel_start', (data) => {
      this.inMatch$.next(true);
      this.inQueue$.next(false);
      this.currentDeck$.next(data.deck);
      this.opponent$.next(data.opponent);
      this.selectedCard$.next(null);
      this.myCardPlayed$.next(null);
      this.opponentCardPlayed$.next(null);
      this.roundResult$.next(null);
      this.statusMessage$.next(`Duelo contra ${data.opponent}`);
    });

    this.socket.on('queue_left', () => {
      if (!this.inMatch$.value && this.inQueue$.value) {
        this.statusMessage$.next('Saiu da fila recentemente.');
        this.inQueue$.next(false);
      }
    });

    this.socket.on('roundResult', (data) => {
      const selected = this.selectedCard$.value;
      this.myCardPlayed$.next(selected);
      this.opponentCardPlayed$.next(data.opponentCard);
      this.roundResult$.next(data.result);

      switch (data.result) {
        case 'win':
          this.statusMessage$.next('Você venceu a rodada!');
          break;
        case 'lose':
          this.statusMessage$.next('Você perdeu a rodada!');
          break;
        case 'draw':
          this.statusMessage$.next('Empate na rodada!');
          break;
      }
    });

    this.socket.on('nextRound', (data) => {
      this.currentDeck$.next(data.deck);
      this.selectedCard$.next(null);
      this.myCardPlayed$.next(null);
      this.opponentCardPlayed$.next(null);
      this.roundResult$.next(null);
      this.statusMessage$.next('Nova rodada. Escolha sua carta.');
    });

    this.socket.on('duelEnded', (data) => {
      if (data.winnerSocketId === this.socket.id) {
        this.statusMessage$.next('Você venceu o duelo!');
      } else if (data.winnerSocketId === null) {
        this.statusMessage$.next('O duelo terminou empatado!');
      } else {
        this.statusMessage$.next('Você perdeu o duelo!');
      }

      this.inMatch$.next(false);
      this.inQueue$.next(false);
      this.currentDeck$.next([]);
      this.selectedCard$.next(null);
      this.myCardPlayed$.next(null);
      this.opponentCardPlayed$.next(null);
      this.roundResult$.next(null);
    });

    this.socket.on('error', (msg) => {
      this.statusMessage$.next(`Erro: ${msg}`);
    });
  }

  joinQueue(): void {
    if (this.socket?.connected) this.socket.emit('join_duel_queue');
  }

  leaveQueue(): void {
    if (this.socket?.connected) this.socket.emit('leave_duel_queue');
  }

  playCard(card: Card): void {
    if (!this.inMatch$.value || !card || !this.socket?.connected) return;
    this.selectedCard$.next(card);
    this.socket.emit('playCard', { selectedCard: card });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.statusMessage$.next('Desconectado');
    this.inQueue$.next(false);
    this.inMatch$.next(false);
    this.currentDeck$.next([]);
    this.selectedCard$.next(null);
    this.opponent$.next(null);
    this.myCardPlayed$.next(null);
    this.opponentCardPlayed$.next(null);
    this.roundResult$.next(null);
  }
}

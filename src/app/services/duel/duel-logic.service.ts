import { Injectable } from '@angular/core';
import { DuelStateService, RoundResultPayload } from './duel-state.service';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DuelLogicService {
  private mySocketId?: string;

  constructor(private state: DuelStateService, private socket: SocketService) {}

  setupListeners() {
    const errorMessages: Record<string, string> = {
      INSUFFICIENT_DECK: 'Vincule 10 cartas para duelar.',
      ONESELF_DUEL: 'Não é possível duelar contra si mesmo.',
      QUEUE_JOIN_FAILED: 'Falha ao entrar na fila.',
      ROOM_NOT_FOUND: 'Sala não encontrada.',
      CARD_NOT_FOUND: 'Carta não encontrada.',
      ALREADY_IN_MATCH: 'Você já está em um duelo em andamento.',
      ALREADY_IN_QUEUE: 'Você já está na fila.',
      GENERIC_ERROR: 'Ocorreu um erro inesperado.'
    };

    this.socket.on('connect', () => {
      this.state.statusMessage$.next('Conectado');
      this.mySocketId = this.socket.id;
    });

    this.socket.on('waiting_for_opponent', () => {
      this.state.inQueue$.next(true);
      this.state.statusMessage$.next('Aguardando oponente...');
    });

    // this.socket.on('insuficient_deck', () => {
    //   this.state.statusMessage$.next('Você precisa de pelo menos 10 cartas.');
    // });

    this.socket.on('duel_start', (data) => {
      this.state.inMatch$.next(true);
      this.state.inQueue$.next(false);
      this.state.currentDeck$.next(data.deck);
      this.state.opponent$.next(data.opponent);
      this.resetRoundState();
      this.state.statusMessage$.next(`Duelo contra ${data.opponent}`);
    });

    this.socket.on('queue_left', () => {
      if (!this.state.inMatch$.value && this.state.inQueue$.value) {
        this.state.statusMessage$.next('Saiu da fila recentemente.');
        this.state.inQueue$.next(false);
      }
    });

    this.socket.on('roundResult', (data) => {
      const selected = this.state.selectedCard$.value;
      if (!selected) return;

      const payload: RoundResultPayload = {
        myCard: selected,
        opponentCard: data.opponentCard,
        result: data.result,
      };

      this.state.setRoundResultPayload(payload);
      this.state.myCardPlayed$.next(selected);
      this.state.opponentCardPlayed$.next(data.opponentCard);
      this.state.roundResult$.next(data.result);

      this.state.statusMessage$.next('Resultado da rodada anterior recebido:');
    });

    this.socket.on('nextRound', (data) => {
      this.state.currentDeck$.next(data.deck);
      this.resetRoundState();
    });

    this.socket.on('duelEnded', (data) => {
      if (data.lastRound) {
        const payload: RoundResultPayload = {
          myCard: data.lastRound.myCard,
          opponentCard: data.lastRound.opponentCard,
          result: data.lastRound.result,
        };
        this.state.setRoundResultPayload(payload);
      }

      this.state.inMatch$.next(false);

      let winner: 'me' | 'opponent' | 'draw' = 'draw';
      if (data.winnerSocketId === this.mySocketId) winner = 'me';
      else if (data.winnerSocketId) winner = 'opponent';

      this.state.emitDuelEnded({ ...data, winner });
    });

    // this.socket.on('error', (msg) => {
    //   this.state.statusMessage$.next(`Erro: ${msg}`);
    // });

    this.socket.on('exception', (err: any) => {
      console.error('WsException recebida:', err);

      if (err?.code && errorMessages[err.code]) { 
        this.state.statusMessage$.next(`${errorMessages[err.code]}`);
      } else { 
        this.state.statusMessage$.next(`${err.message || 'Erro desconhecido.'}`);
      }
    });
  }

  private resetRoundState() {
    this.state.selectedCard$.next(null);
    this.state.myCardPlayed$.next(null);
    this.state.opponentCardPlayed$.next(null);
    this.state.roundResult$.next(null);
  }
}

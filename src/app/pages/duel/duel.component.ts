import { Component, OnInit, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../services/auth.service';
import { Card } from '../../models/card.model';

@Component({
  standalone: false,
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.css'],
})
export class DuelComponent implements OnInit, OnDestroy {
  socket!: Socket;
  statusMessage = 'Desconectado';
  currentDeck: Card[] = [];
  selectedCard: Card | null = null;
  inQueue = false;
  inMatch = false;
  roomId: string | null = null;
  opponent: string | null = null;

  roundResult: string | null = null;
  myCardPlayed: Card | null = null;
  opponentCardPlayed: Card | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();

    if (!token) {
      this.statusMessage = 'Token JWT não encontrado. Faça login.';
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
    });

    this.setupSocketListeners();

    //  this.socket.emit('join_duel_queue');
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  joinQueue(): void {
    if (!this.socket?.connected) return;
    this.socket.emit('join_duel_queue');
  }

  leaveQueue(): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_duel_queue');
  }

  playCard(card: Card): void {
    if (!this.inMatch || !card || !this.socket?.connected) return;
    this.selectedCard = card;
    this.socket.emit('playCard', { selectedCard: card });
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.statusMessage = 'Conectado';
    });

    this.socket.on('waiting_for_opponent', () => {
      this.inQueue = true;
      this.statusMessage = 'Aguardando oponente...';
    });

    this.socket.on('insuficient_deck', () => {
      this.statusMessage =
        'Você precisa de pelo menos 10 cartas para entrar no duelo.';
    });

    this.socket.on('duel_start', (data) => {
      this.inMatch = true;
      this.inQueue = false;
      this.roomId = data.roomId;
      this.opponent = data.opponent;
      this.currentDeck = data.deck;
      this.selectedCard = null;
      this.myCardPlayed = null;
      this.opponentCardPlayed = null;
      this.roundResult = null;
      this.statusMessage = `Duelo contra ${this.opponent}`;
    });

    this.socket.on('queue_left', () => {
      if (!this.inMatch && this.inQueue) {
        this.statusMessage = 'Saiu da fila recentemente.';
        this.inQueue = false;
      }
    });

    this.socket.on('roundResult', (data) => {
      this.myCardPlayed = this.selectedCard;
      this.opponentCardPlayed = data.opponentCard;
      this.roundResult = data.result;

      switch (data.result) {
        case 'win':
          this.statusMessage = 'Você venceu a rodada!';
          break;
        case 'lose':
          this.statusMessage = 'Você perdeu a rodada!';
          break;
        case 'draw':
          this.statusMessage = 'Empate na rodada!';
          break;
      }
    });

    this.socket.on('duelEnded', (data) => {
      if (data.winnerSocketId === this.socket.id) {
        this.statusMessage = 'Você venceu o duelo!';
      } else if (data.winnerSocketId === null) {
        this.statusMessage = 'O duelo terminou empatado!';
      } else {
        this.statusMessage = 'Você perdeu o duelo!';
      }

      this.inMatch = false;
      this.inQueue = false;
      this.currentDeck = [];
      this.selectedCard = null;
      this.myCardPlayed = null;
      this.opponentCardPlayed = null;
      this.roundResult = null;
    });

    this.socket.on('nextRound', (data) => {
      this.currentDeck = data.deck;
      this.selectedCard = null;
      this.myCardPlayed = null;
      this.opponentCardPlayed = null;
      this.roundResult = null;
      this.statusMessage = 'Nova rodada. Escolha sua carta.';
    });

    this.socket.on('error', (msg) => {
      this.statusMessage = `Erro: ${msg}`;
    });
  }
}

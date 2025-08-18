import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DuelLogicService } from './duel-logic.service';
import { DuelStateService } from './duel-state.service';
import { SocketService } from './socket.service';
import { Card } from '../../models/card.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DuelService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private socket: SocketService,
    private logic: DuelLogicService,
    private state: DuelStateService
  ) {}

  connect() {
    const token = this.authService.getToken();
    if (!token) {
      this.state.statusMessage$.next('Token JWT não encontrado. Faça login.');
      return;
    }

    this.socket.connect(this.API_URL, { token });
    this.logic.setupListeners();
  }

  joinQueue() {
    if (this.socket.connected) this.socket.emit('join_duel_queue');
  }

  leaveQueue() {
    if (this.socket.connected) this.socket.emit('leave_duel_queue');
  }

  playCard(card: Card) {
    if (!this.state.inMatch$.value || !card || !this.socket.connected) return;
    this.state.selectedCard$.next(card);
    this.socket.emit('playCard', { selectedCard: card });
  }

  logout() {  
    this.resetState();
    this.socket.disconnect(); 
    this.authService.logout();
  }
  
  disconnect() {
    this.socket.disconnect();
    this.resetState();
  }

  resetState(){
    this.state.resetState();
  }
  
}

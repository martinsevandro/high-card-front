import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Card } from '../../models/card.model';

export interface RoundResultPayload {
  myCard: Card;
  opponentCard: Card;
  result: string;
}

@Injectable({ providedIn: 'root' })
export class DuelStateService {
  statusMessage$ = new BehaviorSubject<string>('Desconectado');
  username$ = new BehaviorSubject<string | null>(null);
  inQueue$ = new BehaviorSubject<boolean>(false);
  inMatch$ = new BehaviorSubject<boolean>(false);
  currentDeck$ = new BehaviorSubject<Card[]>([]);
  selectedCard$ = new BehaviorSubject<Card | null>(null);
  opponent$ = new BehaviorSubject<string | null>(null);
  myCardPlayed$ = new BehaviorSubject<Card | null>(null);
  opponentCardPlayed$ = new BehaviorSubject<Card | null>(null);
  roundResult$ = new BehaviorSubject<string | null>(null);
  roundPhase$ = new BehaviorSubject<'selection'|'waiting'|'result'|'done'|'idle'>('idle');

  private duelEndedSubject = new Subject<any>();
  duelEnded$ = this.duelEndedSubject.asObservable();

  private roundResultPayloadSubject = new BehaviorSubject<RoundResultPayload | null>(null);
  roundResultPayload$ = this.roundResultPayloadSubject.asObservable();

  setUsername(username: string) {
    this.username$.next(username);
  }

  setRoundResultPayload(payload: RoundResultPayload) {
    this.roundResultPayloadSubject.next(payload);
  }

  clearRoundResultPayload() {
    this.roundResultPayloadSubject.next(null);
  }

  emitDuelEnded(data: any) {
    this.duelEndedSubject.next(data);
  }

  resetState(): void {
    this.statusMessage$.next('Resetado com sucesso');
    this.inQueue$.next(false);
    this.inMatch$.next(false);
    this.currentDeck$.next([]);
    this.selectedCard$.next(null);
    this.opponent$.next(null);
    this.myCardPlayed$.next(null);
    this.opponentCardPlayed$.next(null);
    this.roundResult$.next(null); 
    this.duelEndedSubject.next(null);
    this.roundResultPayloadSubject.next(null);
    this.roundPhase$.next('idle');
  }
 
}

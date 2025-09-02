import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card } from '../../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardStateService {
  private cardSource = new BehaviorSubject<Card | null>(null);
  card$ = this.cardSource.asObservable();

  private cardElementSource = new BehaviorSubject<HTMLElement | null>(null);
  cardElement$ = this.cardElementSource.asObservable();

  private cardDeletedSource = new BehaviorSubject<string | null>(null);
  cardDeleted$ = this.cardDeletedSource.asObservable();

  private cardMessageSource = new BehaviorSubject<string | null>(null);
  cardMessage$ = this.cardMessageSource.asObservable();

  setCard(card: Card | null) {
    this.cardSource.next(card);
  }

  setCardElement(element: HTMLElement | null) {
    this.cardElementSource.next(element);
  }

  emitCardDeleted(cardId: string) { 
    this.cardDeletedSource.next(cardId);
  }

  setCardMessage(message: string | null) {
    this.cardMessageSource.next(message);
  }
  
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardStateService {
  private cardSource = new BehaviorSubject<Card | null>(null);
  card$ = this.cardSource.asObservable();

  private cardElementSource = new BehaviorSubject<HTMLElement | null>(null);
  cardElement$ = this.cardElementSource.asObservable();

  setCard(card: Card) {
    this.cardSource.next(card);
  }

  setCardElement(element: HTMLElement) {
    this.cardElementSource.next(element);
  }
}

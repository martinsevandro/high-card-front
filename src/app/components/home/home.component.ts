import { Component } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  selectedCard: Card | null = null;

  onCardLoaded(card: Card): void {
    this.selectedCard = card;
  }
}

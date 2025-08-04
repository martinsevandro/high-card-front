import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardStateService } from '../../services/card-state.service';

@Component({
  selector: 'app-card-container',
  standalone: false,
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.css'
})
export class CardContainerComponent {
  @Input() card: Card | null = null;
  @Output() cardElementReady = new EventEmitter<HTMLElement>();

  constructor(private cardState: CardStateService) {}

  handleCardReady(cardElement: HTMLElement): void {
    this.cardElementReady.emit(cardElement);
    this.cardState.setCardElement(cardElement);
  }

}

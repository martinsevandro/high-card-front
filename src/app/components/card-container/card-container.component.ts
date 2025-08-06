import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardStateService } from '../../services/card-state.service';

@Component({
  selector: 'app-card-container',
  standalone: false,
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.css']
})
export class CardContainerComponent implements OnChanges {
  @Input() card: Card | null = null;
  @Output() cardElementReady = new EventEmitter<HTMLElement>();

  constructor(private cardState: CardStateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && this.card) {
      this.cardState.setCard(this.card);
    }
  }

  handleCardReady(cardElement: HTMLElement): void {
    this.cardElementReady.emit(cardElement);
    this.cardState.setCardElement(cardElement);
  }

}

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardStateService } from '../../services/card/card-state.service';

@Component({
  selector: 'app-card-container',
  standalone: false,
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.css']
})
export class CardContainerComponent implements OnChanges, OnDestroy {
  @Input() card: Card | null = null;
  @Input() message: string | null = null;
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

  ngOnDestroy(): void {
    this.cardState.setCard(null);
    this.cardState.setCardElement(null);
  }

}

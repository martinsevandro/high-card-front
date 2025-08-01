import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card-container',
  standalone: false,
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.css'
})
export class CardContainerComponent {
  @Input() card: Card | null = null;
  @Output() cardElementReady = new EventEmitter<HTMLElement>();

   
  handleCardReady(cardElement: HTMLElement): void { 
    this.cardElementReady.emit(cardElement);
  }

}

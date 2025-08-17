import { Component, OnInit } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardStateService } from '../../services/card/card-state.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  selectedCard: Card | null = null;
  cardElement!: HTMLElement | null;
  cardMessage: string | null = null;

  constructor(private cardState: CardStateService) {}

  ngOnInit(): void {
    this.cardState.setCard(null);
    this.selectedCard = null;
    this.cardElement = null;

    this.cardState.card$.subscribe((card) => {
      this.selectedCard = card;
    });

    this.cardState.cardElement$.subscribe((element) => {
      if (element) {
        this.cardElement = element;
      }
    });

    this.cardState.cardMessage$.subscribe((message) => {
      this.cardMessage = message;
    });
  }
}

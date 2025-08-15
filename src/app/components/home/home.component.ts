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
  cardElement!: HTMLElement;

  constructor(private cardState: CardStateService) {}

  ngOnInit(): void {
    this.cardState.card$.subscribe((card) => {
      this.selectedCard = card;
    });

    this.cardState.cardElement$.subscribe((element) => {
      if (element) {
        this.cardElement = element;
      }
    });
  }
}

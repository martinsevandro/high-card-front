import { Component, OnInit } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardsService } from '../../services/cards.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deck',
  standalone: false,
  templateUrl: './deck.component.html',
})
export class DeckComponent implements OnInit {
  deck: Card[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private cardsService: CardsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Você precisa estar logado para ver o deck.';
      this.loading = false;
      return;
    }

    this.cardsService.getMyDeck().subscribe({
      next: (cards: any) => {
        this.deck = cards;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar o deck.';
        this.loading = false;
      },
    });
  }

  currentIndex = 0;

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  hasNext(): boolean {
    return this.currentIndex < this.deck.length - 1;
  }

  selectPrevious(): void {
    if (this.hasPrevious()) {
      this.currentIndex--;
    }
  }

  selectNext(): void {
    if (this.hasNext()) {
      this.currentIndex++;
    }
  }
}

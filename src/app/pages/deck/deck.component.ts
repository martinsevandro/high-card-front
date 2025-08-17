import { Component, OnInit } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardsService } from '../../services/card/cards.service';
import { AuthService } from '../../services/auth/auth.service';
import { CardStateService } from '../../services/card/card-state.service';

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
    private authService: AuthService,
    private cardState: CardStateService
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
        if (this.deck.length > 0) {
          this.cardState.setCard(this.deck[0]);
        }
      },
      error: (err) => {
        this.error = 'Erro ao carregar o deck.';
        this.loading = false;
      },
    });

    this.cardState.cardDeleted$.subscribe((cardId) => {
      if (cardId) {
        this.removeCardById(cardId);
      }
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
      this.cardState.setCard(this.deck[this.currentIndex]);
    }
  }

  selectNext(): void {
    if (this.hasNext()) {
      this.currentIndex++;
      this.cardState.setCard(this.deck[this.currentIndex]);
    }
  }

  removeCardById(cardId: string): void {
    const index = this.deck.findIndex((card) => card._id === cardId);
    if (index > -1) {
      this.deck.splice(index, 1);

      if (this.currentIndex >= this.deck.length) {
        this.currentIndex = Math.max(0, this.deck.length - 1);
      }

      const newCard = this.deck[this.currentIndex] || null;
      this.cardState.setCard(newCard);
    }
  }
}

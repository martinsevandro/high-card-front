import { Component, Input } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card-container',
  standalone: false,
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.css'
})
export class CardContainerComponent {
  @Input() card: Card | null = null;
}

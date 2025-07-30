import { Component, Input, OnInit } from '@angular/core'; 
import { CardHtmlBuilderService } from '../../services/card-html-builder.service';
import { SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: any; 
 
  flipped = false;

  sanitizedStats: SafeHtml = '';
  sanitizedRunas: SafeHtml = '';
  sanitizedSpells: SafeHtml = '';
  sanitizedItems: SafeHtml = '';
  sanitizedAchievements: SafeHtml = '';

  constructor(private cardHtmlBuilder: CardHtmlBuilderService) {} 

  ngOnInit() {
    const blocks = this.cardHtmlBuilder.buildCardBlocksSanitized(this.card); 

    this.sanitizedStats = blocks.stats;
    this.sanitizedRunas = blocks.runas;
    this.sanitizedSpells = blocks.spells;
    this.sanitizedItems = blocks.items;
    this.sanitizedAchievements = blocks.achievements;
  }  

}

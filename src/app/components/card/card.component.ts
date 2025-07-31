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

  sanitizedFirstLine: SafeHtml = '';
  sanitizedSecondLine: SafeHtml = '';
  sanitizedThirdLine: [string, string][] = [];
  sanitizedRunas: SafeHtml = '';
  sanitizedSpells: SafeHtml = '';
  sanitizedItems: SafeHtml = '';
  sanitizedAchievements: SafeHtml = '';

  constructor(private cardHtmlBuilder: CardHtmlBuilderService) {} 

  ngOnInit() {
    const blocks = this.cardHtmlBuilder.buildCardBlocksSanitized(this.card); 

    this.sanitizedFirstLine = blocks.firstLine;
    this.sanitizedSecondLine = blocks.secondLine;
    this.sanitizedThirdLine = blocks.thirdLine;
    this.sanitizedRunas = blocks.runas;
    this.sanitizedSpells = blocks.spells;
    this.sanitizedItems = blocks.items;
    this.sanitizedAchievements = blocks.achievements;
  }  

}

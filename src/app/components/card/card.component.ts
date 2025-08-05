import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CardHtmlBuilderService } from '../../services/card-html-builder.service';
import { SafeHtml } from '@angular/platform-browser';
import VanillaTilt from 'vanilla-tilt';

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() card: any;
  @Input() enableEffects: boolean = true;

  @ViewChild('cardRoot') cardRoot!: ElementRef;

  flipped = false;
  rotationDirection: 'left' | 'right' = 'right';

  sanitizedFirstLine: SafeHtml = '';
  sanitizedSecondLine: SafeHtml = '';
  sanitizedThirdLine: [string, string][] = [];
  sanitizedRunas: SafeHtml = '';
  sanitizedSpells: SafeHtml = '';
  sanitizedItems: SafeHtml = '';
  sanitizedAchievements: SafeHtml = '';

  constructor(private cardHtmlBuilder: CardHtmlBuilderService) {}

  @Output() cardElementReady = new EventEmitter<HTMLElement>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && this.card) {
      this.flipped = false;
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

  ngAfterViewInit(): void {
    if (this.enableEffects) {
      VanillaTilt.init(this.cardRoot.nativeElement, {
        max: 2,
        speed: 100,
        reverse: true,
      });
    }

    this.cardElementReady.emit(this.cardRoot.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.enableEffects && this.cardRoot?.nativeElement?.vanillaTilt) {
      this.cardRoot.nativeElement.vanillaTilt.destroy();
    }
  }

  toggleFlip(event: MouseEvent) {
    const cardRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const clickX = event.clientX - cardRect.left;

    this.rotationDirection = clickX < cardRect.width / 2 ? 'left' : 'right';

    this.flipped = !this.flipped;
  }
}

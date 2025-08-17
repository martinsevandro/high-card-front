import {
  Component,
  EventEmitter,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { RiotService } from '../../services/riot/riot.service';
import { Card } from '../../models/card.model';
import html2canvas from 'html2canvas';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CardStateService } from '../../services/card/card-state.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CardsService } from '../../services/card/cards.service';
import { CreateCardDto } from '../../components/card/card-create.dto'; 
import { DuelService } from '../../services/duel/duel.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  name: string = '';
  tag: string = '';
  server: string = 'br1';
  matchId: string = '';

  cardElement!: HTMLElement | null;
  cartaEsperada!: Card;

  @Output() cardLoaded = new EventEmitter<Card>();

  private destroy$ = new Subject<void>();
  public currentRouter: string = '';

  constructor(
    private riotService: RiotService,
    public auth: AuthService,
    private router: Router,
    private cardState: CardStateService,
    private cardsService: CardsService,
    private duelService: DuelService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.currentRouter = event.urlAfterRedirects;
        // console.log('Rota atual:', this.currentRouter);
      });

    this.cardState.cardElement$
      .pipe(takeUntil(this.destroy$))
      .subscribe((element) => {
        // console.log('Card element received:', element);
        this.cardElement = element as HTMLElement;
      });

    this.cardState.card$.subscribe((card) => (this.cartaEsperada = card as Card));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.duelService.logout();
    this.auth.clearToken();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  isAuthPage(): boolean {
    return this.router.url === "/login" || this.router.url === "/register";
  }

  async buscarCarta(): Promise<void> {
    if (!this.name || !this.tag || !this.server) return;

    try {
      const account = await this.riotService.getAccountByRiotId(
        this.name,
        this.tag,
        this.server
      );
      let card: Card | undefined;

      if (this.matchId && this.matchId.trim() !== '') {
        card = await this.riotService.getSpecificMatchDetails(
          account.puuid,
          this.server,
          this.matchId
        );
      } else {
        card = await this.riotService.getLatestMatchDetails(
          account.puuid,
          this.server
        );
      }

      if (card) {
        this.cartaEsperada = card;
        this.cardLoaded.emit(card);
        this.cardState.setCard(card);
        this.cardState.setCardMessage(null);  
      } else {
        this.cardState.setCard(null);
        this.cardState.setCardMessage('Carta não encontrada. Verifique os dados.');
      }
    } catch (error) {
      this.cardState.setCard(null);
      this.cardState.setCardMessage('Erro ao buscar dados da carta. Tente novamente.');
    }
  }

  salvarImagem(): void {
    // console.log('Botão de salvar clicado');

    if (this.cardElement) {
      this.cardState.setCardElement(this.cardElement);

      if (!this.cardElement) {
        // console.warn('Carta não encontrada!');
        return;
      }

      const inner = this.cardElement.querySelector('.flip-inner');
      if (!inner) return;

      const back = this.cardElement.querySelector('.flip-back');
      if (!back) return;

      const isFlipped = inner?.classList.contains('rotate-y-180');

      inner?.classList.remove('rotate-y-180');
      inner && ((inner as HTMLElement).style.transform = 'none');
      back && ((back as HTMLElement).style.visibility = 'hidden');

      setTimeout(() => {
        html2canvas(this.cardElement!, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
        }).then((canvas) => {
          if (isFlipped) {
            inner?.classList.add('rotate-y-180');
            inner && ((inner as HTMLElement).style.transform = '');
          }
          back && ((back as HTMLElement).style.visibility = '');

          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = 'carta-jogador.png';
          a.click();
        });
      }, 500);
    }
  }

  curtirCarta(card: Card): void {
    const dto: CreateCardDto = {
      gameMode: card.gameMode,
      championName: card.championName,
      riotIdGameName: card.riotIdGameName,
      riotIdTagline: card.riotIdTagline,
      positionPlayer: card.positionPlayer,
      role: card.role,
      realRole: card.realRole,
      kills: card.kills,
      deaths: card.deaths,
      assists: card.assists,
      kda: card.kda,
      killParticipation: card.killParticipation,
      totalDamageDealtToChampions: card.totalDamageDealtToChampions,
      totalMinionsKilled: card.totalMinionsKilled,
      totalNeutralMinionsKilled: card.totalNeutralMinionsKilled,
      totalMinionsKilledJg: card.totalMinionsKilledJg,
      teamId: card.teamId,
      teamDragonsKilled: card.teamDragonsKilled,
      teamBaronsKilled: card.teamBaronsKilled,
      matchDragons: card.matchDragons,
      matchBarons: card.matchBarons,
      jungleKing: card.jungleKing,
      gameLength: card.gameLength,
      damagePerMinute: card.damagePerMinute,
      minionsPerMinute: card.minionsPerMinute,
      minionsPerMinuteJg: card.minionsPerMinuteJg,
      goldPerMinute: card.goldPerMinute,
      timeCCingOthers: card.timeCCingOthers,
      visionScore: card.visionScore,
      firstBloodKill: card.firstBloodKill,
      firstBloodAssist: card.firstBloodAssist,
      firstTowerKill: card.firstTowerKill,
      firstTowerAssist: card.firstTowerAssist,
      totalDamageShieldedOnTeammates: card.totalDamageShieldedOnTeammates,
      totalHealsOnTeammates: card.totalHealsOnTeammates,
      totalDamageTaken: card.totalDamageTaken,
      baronKills: card.baronKills,
      dragonKills: card.dragonKills,
      quadraKills: card.quadraKills,
      pentaKills: card.pentaKills,
      splashArt: card.splashArt,
      iconChampion: card.iconChampion,
      corDaBorda: card.corDaBorda,
      corDoVerso: card.corDoVerso,
      perks: card.perks,
      summonerSpells: card.summonerSpells,
      items: card.items,
      augments: card.augments,
      achievements: card.achievements,
      gameDate: card.gameDate,
    };

    this.cardsService.saveCard(dto).subscribe({
      next: () => console.log('Carta vinculada com sucesso'),
      error: (err) => console.error('Erro ao vincular carta:', err),
    });
  }

  descurtirCarta(): void {
    if (!this.cartaEsperada || !this.cartaEsperada._id) {
      // console.error('Nenhuma carta selecionada ou ID ausente.');
      return;
    }

    this.cardsService.deleteCard(this.cartaEsperada._id).subscribe({
      next: () => {
        this.cardState.emitCardDeleted(this.cartaEsperada._id);
        // console.log('Carta removida com sucesso.');
        this.router.navigate(['/deck']);
      },
      error: (err) => console.error('Erro ao remover carta:', err),
    });
  }

  nomeUsuario(): string {
    const username = this.auth.getUsername();
    return username ? username : 'Usuário Desconhecido';
  }
}

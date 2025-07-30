export interface Card {
  gameMode: string;
  championName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  positionPlayer: string;
  role: string;
  realRole: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  killParticipation: string;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  totalNeutralMinionsKilled: number;
  totalMinionsKilledJg: number;
  teamId: number;
  teamDragonsKilled: number;
  teamBaronsKilled: number;
  matchDragons: number;
  matchBarons: number;
  jungleKing: boolean;
  gameLength: number;
  damagePerMinute: string;
  minionsPerMinute: string;
  minionsPerMinuteJg: string;
  goldPerMinute: string;
  timeCCingOthers: number;
  visionScore: number;
  firstBloodKill: boolean;
  firstBloodAssist: boolean;
  firstTowerKill: boolean;
  firstTowerAssist: boolean;
  totalDamageShieldedOnTeammates: number;
  totalHealsOnTeammates: number;
  totalDamageTaken: number;
  baronKills: number;
  dragonKills: number;
  quadraKills: number;
  pentaKills: number;
  splashArt: string;
  iconChampion: string;
  corDaBorda: string;
  corDoVerso: string;
  gameDate: string;
  achievements: string[];

  perks: {
    defense: string;
    flex: string;
    offense: string;
    primaryStyle: string;
    primaryStyleSec: string;
    primaryStyleTert: string;
    primaryStyleQuat: string;
    subStyle: string;
    subStyleSec: string;
  };

  summonerSpells: {
    spell1: string;
    spell2: string;
  };

  items: {
    item0: string;
    item1: string;
    item2: string;
    item3: string;
    item4: string;
    item5: string;
    item6: string;
  };

  augments: {
    augment1: string;
    augment2: string;
    augment3: string;
    augment4: string;
    augment5: string;
    augment6: string;
  };
}

import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; 

type PlayerProfile = 'CHERRY' | 'URF' | 'sup' | 'jungle' | 'default';

interface StatLayout  {
  getCsLabel: (data: any) => string;
  secondStat: (data: any) => string;
  thirdLine: (data: any) => [string, string][];
}

interface AchievementConfig {
  condition: (data: any) => boolean;
  filename: string;
  title: string;
  alt: string;
}

interface CardBlocks {
  firstLine: SafeHtml;
  secondLine: SafeHtml;
  thirdLine: [string, string][];
  runas: SafeHtml;
  spells: SafeHtml;
  items: SafeHtml;
  achievements: SafeHtml;
}

@Injectable({ providedIn: 'root' })
export class CardHtmlBuilderService {
  private readonly baseAchievementPath = 'assets/achievements/';
  private readonly statLayout: Record<PlayerProfile, StatLayout>;
  private readonly achievementConfigs: AchievementConfig[];

  constructor(private sanitizer: DomSanitizer) {
    this.statLayout = this.initStatLayouts();
    this.achievementConfigs  = this.initAchievementConfigs();
  }

  private initStatLayouts(): Record<PlayerProfile, StatLayout> {
    return {
      CHERRY: this.createProfileLayout(
        data => this.createChampionImageTag(data.iconChampion),
        data => `${data.timeCCingOthers}s CC`,
        ['Damage', 'DamagePM', 'GoldPM'],
        data => [
          data.totalDamageDealtToChampions,
          data.damagePerMinute,
          data.goldPerMinute
        ]
      ),
      URF: this.createProfileLayout(
        data => `${data.totalMinionsKilled} CS`,
        data => `${data.timeCCingOthers}s CC`,
        ['Damage', 'DmgTaken', 'Heals'],
        data => [
          data.totalDamageDealtToChampions,
          data.totalDamageTaken,
          data.totalHealsOnTeammates
        ]
      ),
      sup: this.createProfileLayout(
        data => `${data.totalMinionsKilled} CS`,
        data => `${data.timeCCingOthers}s CC`,
        ['Damage', 'VisionScore', 'GoldPM'],
        data => [
          data.totalDamageDealtToChampions,
          data.visionScore,
          data.goldPerMinute
        ]
      ),
      jungle: this.createProfileLayout(
        data => `${data.totalMinionsKilledJg} CS`,
        data => `${data.minionsPerMinuteJg} CSPM`,
        ['Damage', 'DamagePM', 'GoldPM'],
        data => [
          data.totalDamageDealtToChampions,
          data.damagePerMinute,
          data.goldPerMinute
        ]
      ),
      default: this.createProfileLayout(
        data => `${data.totalMinionsKilled} CS`,
        data => `${data.minionsPerMinute} CSPM`,
        ['Damage', 'DamagePM', 'GoldPM'],
        data => [
          data.totalDamageDealtToChampions,
          data.damagePerMinute,
          data.goldPerMinute
        ]
      )
    };
  }

  private initAchievementConfigs(): AchievementConfig[] {
    return [
      this.createAchievementConfig( 
        data => data.gameMode === 'CLASSIC' && data.jungleKing && data.deaths === 0 && data.killParticipation >= 60.0,
        'challenge-finalBoss.png',
        'The Final Boss',
        'achievement-finalBoss'
      ),
      this.createAchievementConfig(
        data => data.deaths === 0 && (data.gameMode === 'CHERRY' || data.killParticipation >= 60.0),
        'challenge-perfectMatch.png',
        'This is Perfect',
        'achievement-perfectMatch'
      ),
      this.createAchievementConfig(
        data => data.gameMode === 'CLASSIC' && data.jungleKing && data.killParticipation >= 40.0,
        'challenge-jungleKing.png',
        'The Jungle King',
        'achievement-jungleKing'
      ),
      this.createAchievementConfig(
        data => data.damagePerMinute >= 1000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0),
        'challenge-damageDealt.png',
        'The Damage Master',
        'achievement-damageDealt'
      ),
      this.createAchievementConfig(
        data => data.totalDamageTaken >= 10000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0),
        'challenge-damageTaken.png',
        'The Tank',
        'achievement-damageTaken'
      ),
      this.createAchievementConfig(
        data => data.totalDamageShieldedOnTeammates >= 5000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0),
        'challenge-shieldOnTeammates.png',
        'The Protect',
        'achievement-shieldOnTeammates'
      ),
      this.createAchievementConfig(
        data => data.visionScore >= 80 && data.killParticipation >= 40.0,
        'challenge-visionScore.png',
        'Super Vision!',
        'achievement-visionScore'
      ),
      this.createAchievementConfig(
        data => data.pentaKills > 0,
        'challenge-pentaKill.png',
        'Penta Kill!',
        'achievement-pentaKill'
      ),
      this.createAchievementConfig(
        data => data.totalHealsOnTeammates >= 5000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0),
        'challenge-healer.png',
        'The Ambulance',
        'achievement-HealsOnTeammates'
      )
    ];
  }

  private createProfileLayout(
    getCsLabel: (data: any) => string,
    secondStat: (data: any) => string,
    labels: string[],
    getValues: (data: any) => any[]
  ): StatLayout {
    return {
      getCsLabel,
      secondStat,
      thirdLine: data => this.buildStatLine(labels, getValues(data))
    };
  }

  private createAchievementConfig(
    condition: (data: any) => boolean,
    filename: string,
    title: string,
    alt: string
  ): AchievementConfig {
    return { condition, filename, title, alt };
  }

  private createChampionImageTag(imgUrl: string, size = 'w-12 h-12', alt = 'duoChampion'): string {
    return this.sanitizeImageTag(imgUrl, size, alt);
  }

  private escapeHTML(text: string): string {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => replacements[m]);
  }

  private sanitizeImageTag(imgUrl: string, extraClasses = '', alt = ''): string {
    const safeUrl = this.escapeHTML(imgUrl);
    const safeAlt = this.escapeHTML(alt);
    return `<img src="${safeUrl}" style="width:1.5rem; height:1.5rem;" class="inline mx-[2px] ${extraClasses}" alt="${safeAlt}" />`;
  }

  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.escapeHTML(min.toString())}m ${this.escapeHTML(secs.toString())}s`;
  }

  private buildStatLine(labels: string[], values: any[]): [string, string][] {
    return labels.map((label, i) => [label, this.escapeHTML(values[i]?.toString())]);
  }

  private buildFlexContainer(content: string, classes = 'flex justify-between items-end text-sm font-medium'): string {
    return `<div class="${classes}">${content}</div>`;
  }

  private buildStatItem(content: string, classes = 'text-white px-1 rounded'): string {
    return `<span class="${classes}">${content}</span>`;
  }

  private buildFirstLine(data: any, csLabel: string): string {
    const kda = this.escapeHTML(`${data.kills}/${data.deaths}/${data.assists}`);
    const gameTime = this.escapeHTML(this.formatTime(data.gameLength));

    return this.buildFlexContainer([
      this.buildStatItem(kda),
      this.buildStatItem(gameTime),
      this.buildStatItem(csLabel)
    ].join(''));
  }

  private buildSecondLine(data: any, thirdValue: string): string {
    const kda = this.escapeHTML(data.kda);
    const kp = this.escapeHTML(data.killParticipation);

    return this.buildFlexContainer([
      this.buildStatItem(`${kda} KDA`),
      this.buildStatItem(`${kp} KP%`),
      this.buildStatItem(this.escapeHTML(thirdValue))
    ].join(''), 'flex justify-between text-sm font-medium text-center p-0');
  }

  // private buildThirdLine(stats: [string, string][]): string {
  //   const alignments = ['items-start', 'items-center', 'items-end'];
  //   const statItems = stats.map(([label, value], i) => `
  //     <div class="w-1/3 flex flex-col ${alignments[i]} text-white px-1 rounded">
  //       <div class="truncate">${label}</div>
  //       <div class="truncate">${value}</div>
  //     </div>
  //   `).join('');

  //   return this.buildFlexContainer(statItems, 'flex w-full text-sm font-medium px-1 gap-1 pb-2');
  // }

  private buildRunasContent(data: any): string {
    if (data.gameMode === 'CHERRY') {
      const augments = (Object.values(data.augments || {}) as string[])
        .filter(url => url)
        .map(url => this.sanitizeImageTag(url, 'bg-black rounded', 'augment'))
        .join('');

      return `<div class="flex flex-wrap gap-1 mt-1">${augments}</div>`;
    }

    const perks = data.perks || {};
    const runes = this.buildRunesSection(perks);
    const statPerks = this.buildStatPerksSection(perks);

    return `
      <div class="flex justify-between items-center mt-2">
        ${runes}
        ${statPerks}
      </div>
    `;
  }

  private buildRunesSection(perks: any): string {
    const runeUrls = [
      perks.primaryStyle,
      perks.primaryStyleSec,
      perks.primaryStyleTert,
      perks.primaryStyleQuat,
      perks.subStyle,
      perks.subStyleSec,
    ].filter((url): url is string => !!url);

    return `<div class="flex flex-wrap gap-1">${
      runeUrls.map((url, i) => this.sanitizeImageTag(url, '', `rune${i}`)).join('')
    }</div>`;
  }

  private buildStatPerksSection(perks: any): string {
    const perkUrls = [
      perks.offense,
      perks.flex,
      perks.defense,
    ].filter((url): url is string => !!url);

    return `<div class="flex gap-1 ml-2">${
      perkUrls.map((url, i) => this.sanitizeImageTag(url, '', `perk${i}`)).join('')
    }</div>`;
  }

  private buildSpellsContent(data: any): string {
    const spells = data.summonerSpells || {};
    const spellImages = [
      this.sanitizeImageTag(spells.spell1, '', 'spell1'),
      this.sanitizeImageTag(spells.spell2, '', 'spell2'),
    ].filter(img => img.includes('src="')).join('');

    return spellImages ? `<div class="flex gap-1 ml-2 mt-1">${spellImages}</div>` : '';
  }

  private buildItemsContent(data: any): string {
    const items = (Object.values(data.items || {}) as string[])
      .filter(url => url)
      .map(url => this.sanitizeImageTag(url, 'bg-black rounded', `item ${url}`))
      .join('');

    return items ? `<div class="flex flex-wrap gap-1 mt-1">${items}</div>` : '';
  }

  private buildAchievementsContent(data: any): string {
    const achievements = this.achievementConfigs
      .filter(config => config.condition(data))
      .map(config => this.createAchievementHtml(config));

    return achievements.join('\n');
  }

  private createAchievementHtml(config: AchievementConfig): string {
    return `<img src="${this.baseAchievementPath}${config.filename}" 
           class="inline-block" 
           alt="${this.escapeHTML(config.alt)}" 
           title="${this.escapeHTML(config.title)}">`;
  }
  
  buildCardBlocksSanitized(data: any): CardBlocks {
    const profile = this.determineProfile(data);
    const layout = this.statLayout[profile];
    
    if (profile === 'URF') {
      data.killParticipation = '42';
    }

    return {
      firstLine: this.sanitizeHtml(this.buildFirstLine(data, layout.getCsLabel(data))),
      secondLine: this.sanitizeHtml(this.buildSecondLine(data, layout.secondStat(data))),
      thirdLine: layout.thirdLine(data),
      runas: this.sanitizeHtml(this.buildRunasContent(data)),
      spells: this.sanitizeHtml(this.buildSpellsContent(data)),
      items: this.sanitizeHtml(this.buildItemsContent(data)),
      achievements: this.sanitizeHtml(this.buildAchievementsContent(data))
    };
  }

  private determineProfile(data: any): PlayerProfile {
    if (data.gameMode === 'CHERRY') return 'CHERRY';
    if (data.gameMode === 'URF') return 'URF';
    if (data.realRole === 'sup') return 'sup';
    if (data.realRole === 'jungle') return 'jungle';
    return 'default';
  }

  private sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}

// import { Injectable } from '@angular/core';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// @Injectable({
//   providedIn: 'root',
// })
// export class CardHtmlBuilderService {
//   constructor(private sanitizer: DomSanitizer) {}

//   escapeHTML(text: string): string {
//     return text
//       .replace(/&/g, '&amp;')
//       .replace(/</g, '&lt;')
//       .replace(/>/g, '&gt;')
//       .replace(/"/g, '&quot;')
//       .replace(/'/g, '&#039;');
//   }

//   sanitizeImageTag(imgUrl: string, extraClasses = '', alt = ''): string {
//     const safeUrl = this.escapeHTML(imgUrl);
//     const safeAlt = this.escapeHTML(alt);
//     return `<img src="${safeUrl}" style="width:1.5rem; height:1.5rem;" class="inline mx-[2px] ${extraClasses}" alt="${safeAlt}" />`;
//   }

//   formatTime(seconds: number): string {
//     const min = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${min}m ${secs}s`;
//   }

//   buildFirstLine(data: any, csLabel: string): string {
//     return `
//       <div class="flex justify-between items-end text-sm font-medium">
//         <span class=" text-white px-1 rounded">
//           ${this.escapeHTML(`${data.kills}/${data.deaths}/${data.assists}`)}
//         </span>
//         <span class=" text-white px-1 rounded">
//           ${this.escapeHTML(`${this.formatTime(data.gameLength)}`)}
//         </span>
//         <span class=" text-white px-1 rounded">
//           ${csLabel}
//         </span>
//       </div>
//     `;
//   }

//   buildSecondLine(data: any, thirdValue: string): string {
//     return `
//       <div class="flex justify-between text-sm font-medium text-center p-0"> 
//         <span class=" text-white px-1 rounded">
//           ${this.escapeHTML(data.kda)} KDA
//         </span>
//         <span class=" text-white px-1 rounded">
//           ${this.escapeHTML(data.killParticipation)} KP%
//         </span>
//         <span class=" text-white px-1 rounded">
//           ${this.escapeHTML(thirdValue)}
//         </span>
//       </div>
//     `;
//   }

//   buildThirdLine(stats: [string, string][]): string {
//     return `
//       <div class="flex w-full text-sm font-medium px-1 gap-1 pb-2">
//         <div class="w-1/3 flex flex-col items-start  text-white px-1 rounded">
//           <div class="truncate">${stats[0][0]}</div>
//           <div class="truncate">${stats[0][1]}</div>
//         </div>
//         <div class="w-1/3 flex flex-col items-center  text-white px-1 rounded">
//           <div class="truncate">${stats[1][0]}</div>
//           <div class="truncate">${stats[1][1]}</div>
//         </div>
//         <div class="w-1/3 flex flex-col items-end  text-white px-1 rounded">
//           <div class="truncate">${stats[2][0]}</div>
//           <div class="truncate">${stats[2][1]}</div>
//         </div>
//       </div>
//     `;
//   }

//   runasCardContent(data: any): string {
//     if (data.gameMode === 'CHERRY') {
//       const augments = (Object.values(data.augments || {}) as string[])
//         .filter((url) => !!url)
//         .map((url) => this.sanitizeImageTag(url, 'bg-black rounded', 'augment'))
//         .join('');

//       return `<div class="flex flex-wrap gap-1 mt-1"> ${augments} </div>`;
//     }

//     const p = data.perks || {};
//     const runas = [
//       p.primaryStyle,
//       p.primaryStyleSec,
//       p.primaryStyleTert,
//       p.primaryStyleQuat,
//       p.subStyle,
//       p.subStyleSec,
//     ]
//       .filter((url: string): url is string => !!url)
//       .map((url: string, i) => this.sanitizeImageTag(url, '', `runa${i}`))
//       .join('');

//     const statPerks = [p.offense, p.flex, p.defense]
//       .filter((url: string): url is string => !!url)
//       .map((url: string, i) => this.sanitizeImageTag(url, '', `perk${i}`))
//       .join('');

//     return `
//       <div class="flex justify-between items-center mt-2">
//         <div class="flex flex-wrap gap-1">${runas}</div>
//         <div class="flex gap-1 ml-2">${statPerks}</div>
//       </div>
//     `;
//   }

//   spellsCardContent(data: any): string {
//     const spells = [
//       this.sanitizeImageTag(data.summonerSpells?.spell1, '', 'spell1'),
//       this.sanitizeImageTag(data.summonerSpells?.spell2, '', 'spell2'),
//     ].join('');

//     return `<div class="flex gap-1 ml-2 mt-1"> ${spells} </div>`;
//   }

//   itemsCardContent(data: any): string {
//     const urls = (Object.values(data.items || {}) as string[]).filter(
//       (url): url is string => !!url
//     );

//     const items = urls
//       .map((url) =>
//         this.sanitizeImageTag(url, 'bg-black rounded', `item ${url}`)
//       )
//       .join('');

//     return `<div class="flex flex-wrap gap-1 mt-1"> ${items} </div>`;
//   }

//   achievementsContent(data: any): string {
//     const basePath = 'assets/achievements/';
//     const achievements: string[] = [];

//     const add = (filename: string, title: string, alt: string) => {
//       achievements.push(
//         `<img src="${basePath}${filename}" class="inline-block" alt="${alt}" title="${title}">`
//       );
//     };

//     if (
//       data.gameMode === 'CLASSIC' &&
//       data.jungleKing === true &&
//       data.deaths === 0 &&
//       data.killParticipation >= 60.0
//     ) {
//       add('challenge-finalBoss.png', 'The Final Boss', 'achievement-finalBoss');
//     }

//     if (
//       data.deaths === 0 &&
//       (data.gameMode === 'CHERRY' || data.killParticipation >= 60.0)
//     ) {
//       add(
//         'challenge-perfectMatch.png',
//         'This is Perfect',
//         'achievement-perfectMatch'
//       );
//     }

//     if (
//       data.gameMode === 'CLASSIC' &&
//       data.jungleKing === true &&
//       data.killParticipation >= 40.0
//     ) {
//       add(
//         'challenge-jungleKing.png',
//         'The Jungle King',
//         'achievement-jungleKing'
//       );
//     }

//     if (
//       data.damagePerMinute >= 1000 &&
//       (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)
//     ) {
//       add(
//         'challenge-damageDealt.png',
//         'The Damage Master',
//         'achievement-damageDealt'
//       );
//     }

//     if (
//       data.totalDamageTaken >= 10000 &&
//       (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)
//     ) {
//       add('challenge-damageTaken.png', 'The Tank', 'achievement-damageTaken');
//     }

//     if (
//       data.totalDamageShieldedOnTeammates >= 5000 &&
//       (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)
//     ) {
//       add(
//         'challenge-shieldOnTeammates.png',
//         'The Protect',
//         'achievement-shieldOnTeammates'
//       );
//     }

//     if (data.visionScore >= 80 && data.killParticipation >= 40.0) {
//       add(
//         'challenge-visionScore.png',
//         'Super Vision!',
//         'achievement-visionScore'
//       );
//     }

//     if (data.pentaKills > 0) {
//       add('challenge-pentaKill.png', 'Penta Kill!', 'achievement-pentaKill');
//     }

//     if (
//       data.totalHealsOnTeammates >= 5000 &&
//       (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)
//     ) {
//       add(
//         'challenge-healer.png',
//         'The Ambulance',
//         'achievement-HealsOnTeammates'
//       );
//     }

//     return achievements.join('\n');
//   }

//   buildCardBlocksSanitized(data: any): {
//     firstLine: SafeHtml;
//     secondLine: SafeHtml;
//     thirdLine: [string, string][];
//     runas: SafeHtml;
//     spells: SafeHtml;
//     items: SafeHtml;
//     achievements: SafeHtml;
//   } {
//     type PlayerProfile = 'CHERRY' | 'URF' | 'sup' | 'jungle' | 'default';

//     const statLayout: Record<
//       PlayerProfile,
//       {
//         getCsLabel: (data: any) => string;
//         secondStat: (data: any) => string;
//         thirdLine: (data: any) => [string, string][];
//       }
//     > = {
//       CHERRY: {
//         getCsLabel: (data) =>
//           this.sanitizeImageTag(data.iconChampion, 'w-12 h-12', 'duoChampion'),
//         secondStat: (data) => `${data.timeCCingOthers}s CC`,
//         thirdLine: (data) => [
//           [
//             'Damage',
//             this.escapeHTML(data.totalDamageDealtToChampions?.toString()),
//           ],
//           ['DamagePM', this.escapeHTML(data.damagePerMinute?.toString())],
//           ['GoldPM', this.escapeHTML(data.goldPerMinute?.toString())],
//         ],
//       },
//       URF: {
//         getCsLabel: (data) => `${data.totalMinionsKilled} CS`,
//         secondStat: (data) => `${data.timeCCingOthers}s CC`,
//         thirdLine: (data) => [
//           [
//             'Damage',
//             this.escapeHTML(data.totalDamageDealtToChampions?.toString()),
//           ],
//           ['DmgTaken', this.escapeHTML(data.totalDamageTaken?.toString())],
//           ['Heals', this.escapeHTML(data.totalHealsOnTeammates?.toString())],
//         ],
//       },
//       sup: {
//         getCsLabel: (data) => `${data.totalMinionsKilled} CS`,
//         secondStat: (data) => `${data.timeCCingOthers}s CC`,
//         thirdLine: (data) => [
//           [
//             'Damage',
//             this.escapeHTML(data.totalDamageDealtToChampions?.toString()),
//           ],
//           ['VisionScore', this.escapeHTML(data.visionScore?.toString())],
//           ['GoldPM', this.escapeHTML(data.goldPerMinute?.toString())],
//         ],
//       },
//       jungle: {
//         getCsLabel: (data) => `${data.totalMinionsKilledJg} CS`,
//         secondStat: (data) => `${data.minionsPerMinuteJg} CSPM`,
//         thirdLine: (data) => [
//           [
//             'Damage',
//             this.escapeHTML(data.totalDamageDealtToChampions?.toString()),
//           ],
//           ['DamagePM', this.escapeHTML(data.damagePerMinute?.toString())],
//           ['GoldPM', this.escapeHTML(data.goldPerMinute?.toString())],
//         ],
//       },
//       default: {
//         getCsLabel: (data) => `${data.totalMinionsKilled} CS`,
//         secondStat: (data) => `${data.minionsPerMinute} CSPM`,
//         thirdLine: (data) => [
//           [
//             'Damage',
//             this.escapeHTML(data.totalDamageDealtToChampions?.toString()),
//           ],
//           ['DamagePM', this.escapeHTML(data.damagePerMinute?.toString())],
//           ['GoldPM', this.escapeHTML(data.goldPerMinute?.toString())],
//         ],
//       },
//     };
//     const profile: PlayerProfile =
//       data.gameMode === 'CHERRY'
//         ? 'CHERRY'
//         : data.gameMode === 'URF'
//         ? 'URF'
//         : data.realRole === 'sup'
//         ? 'sup'
//         : data.realRole === 'jungle'
//         ? 'jungle'
//         : 'default';

//     const layout = statLayout[profile];

//     if (profile === 'URF') data.killParticipation = '42';
//     // console.log('CardHtmlBuilderService.buildCardBlocksSanitized', { profile, data });
//     return {
//       firstLine: this.sanitizer.bypassSecurityTrustHtml(
//         this.buildFirstLine(data, layout.getCsLabel(data))
//       ),
//       secondLine: this.sanitizer.bypassSecurityTrustHtml(
//         this.buildSecondLine(data, layout.secondStat(data))
//       ),
//       thirdLine: layout.thirdLine(data),
//       runas: this.sanitizer.bypassSecurityTrustHtml(
//         this.runasCardContent(data)
//       ),
//       spells: this.sanitizer.bypassSecurityTrustHtml(
//         this.spellsCardContent(data)
//       ),
//       items: this.sanitizer.bypassSecurityTrustHtml(
//         this.itemsCardContent(data)
//       ),
//       achievements: this.sanitizer.bypassSecurityTrustHtml(
//         this.achievementsContent(data)
//       ),
//     };
//   }
// }
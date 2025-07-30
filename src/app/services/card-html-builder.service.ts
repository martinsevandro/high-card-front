import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CardHtmlBuilderService {
  constructor(private sanitizer: DomSanitizer) {}

  escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  sanitizeImageTag(imgUrl: string, extraClasses = '', alt = ''): string {
    const safeUrl = this.escapeHTML(imgUrl);
    const safeAlt = this.escapeHTML(alt);
    return `<img src="${safeUrl}" style="width:1.5rem; height:1.5rem;" class="inline mx-[2px] ${extraClasses}" alt="${safeAlt}" />`;
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${min}m ${secs}s`;
  }

  buildFirstLine(data: any, csLabel: string): string {
    return `
      <div class="flex justify-between items-end text-sm font-medium">
        <span class="bg-gray-800 text-white px-1 rounded">
          ${this.escapeHTML(`${data.kills}/${data.deaths}/${data.assists}`)}
        </span>
        <span class="bg-gray-800 text-white px-1 rounded">
          ${this.escapeHTML(`${this.formatTime(data.gameLength)}`)}
        </span>
        <span class="bg-gray-800 text-white px-1 rounded">
          ${csLabel}
        </span>
      </div>
    `;
  }


  buildSecondLine(data: any, thirdValue: string): string {
    return `
      <div class="flex justify-between text-sm font-medium px-1 text-center"> 
        <span class="bg-gray-800 text-white px-1 rounded">
          ${this.escapeHTML(data.kda)} KDA
        </span>
        <span class="bg-gray-800 text-white px-1 rounded">
          ${this.escapeHTML(data.killParticipation)} KP%
        </span>
        <span class="bg-gray-800 text-white px-1 rounded">
          ${this.escapeHTML(thirdValue)}
        </span>
      </div>
    `;
  } 


  buildThirdLine(cols: string[]): string {
    return `
      <div class="flex w-full text-sm font-medium px-1 text-center">
        <span class="w-1/3 text-left bg-gray-800 text-white px-1 rounded">
          ${cols[0]}
        </span>
        <span class="w-1/3 text-center bg-gray-800 text-white px-1 rounded">
          ${cols[1]}
        </span>
        <span class="w-1/3 text-right bg-gray-800 text-white px-1 rounded">
          ${cols[2]}
        </span>
      </div>
    `;
  }


  runasCardContent(data: any): string {
    if (data.gameMode === "CHERRY") {
      const augments = (Object.values(data.augments || {}) as string[])
        .filter(url => !!url)
        .map(url => this.sanitizeImageTag(url, 'bg-black rounded', 'augment'))
        .join('');

      return `<div class="flex flex-wrap gap-1 mt-1"> ${augments} </div>`;
    }

    const p = data.perks || {};
    const runas = [
      p.primaryStyle, p.primaryStyleSec, p.primaryStyleTert, p.primaryStyleQuat,
      p.subStyle, p.subStyleSec
    ]
      .filter((url: string): url is string => !!url)
      .map((url: string, i) => this.sanitizeImageTag(url, '', `runa${i}`))
      .join('');

    const statPerks = [p.offense, p.flex, p.defense]
      .filter((url: string): url is string => !!url)
      .map((url: string, i) => this.sanitizeImageTag(url, '', `perk${i}`))
      .join('');

    return `
      <div class="flex justify-between items-center mt-2">
        <div class="flex flex-wrap gap-1">${runas}</div>
        <div class="flex gap-1 ml-2">${statPerks}</div>
      </div>
    `;

  }


  spellsCardContent(data: any): string {
    const spells = [
      this.sanitizeImageTag(data.summonerSpells?.spell1, '', 'spell1'),
      this.sanitizeImageTag(data.summonerSpells?.spell2, '', 'spell2')
    ].join('');

    return `<div class="flex gap-1 ml-2 mt-1"> ${spells} </div>`;
  }


  itemsCardContent(data: any): string { 
    const urls = (Object.values(data.items || {}) as string[]).filter((url): url is string => !!url);

    const items = urls
      .map(url => this.sanitizeImageTag(url, 'bg-black rounded', `item ${url}`))  
      .join('');

    return `<div class="flex flex-wrap gap-1 mt-1"> ${items} </div>`;
  }


  achievementsContent(data: any): string {
    const basePath = 'assets/achievements/';
    const achievements: string[] = [];

    const add = (filename: string, title: string, alt: string) => {
      achievements.push(`<img src="${basePath}${filename}" class="inline-block" alt="${alt}" title="${title}">`);
    };

    if (data.gameMode === 'CLASSIC' && data.jungleKing === true && data.deaths === 0 && data.killParticipation >= 60.0) {
      add('challenge-finalBoss.png', 'The Final Boss', 'achievement-finalBoss');
    }

    if (data.deaths === 0 && (data.gameMode === 'CHERRY' || data.killParticipation >= 60.0)) {
      add('challenge-perfectMatch.png', 'This is Perfect', 'achievement-perfectMatch');
    }

    if (data.gameMode === 'CLASSIC' && data.jungleKing === true && data.killParticipation >= 40.0) {
      add('challenge-jungleKing.png', 'The Jungle King', 'achievement-jungleKing');
    }

    if (data.damagePerMinute >= 1000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)) {
      add('challenge-damageDealt.png', 'The Damage Master', 'achievement-damageDealt');
    }

    if (data.totalDamageTaken >= 10000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)) {
      add('challenge-damageTaken.png', 'The Tank', 'achievement-damageTaken');
    }

    if (data.totalDamageShieldedOnTeammates >= 5000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)) {
      add('challenge-shieldOnTeammates.png', 'The Protect', 'achievement-shieldOnTeammates');
    }

    if (data.visionScore >= 80 && data.killParticipation >= 40.0) {
      add('challenge-visionScore.png', 'Super Vision!', 'achievement-visionScore');
    }

    if (data.pentaKills > 0) {
      add('challenge-pentaKill.png', 'Penta Kill!', 'achievement-pentaKill');
    }

    if (data.totalHealsOnTeammates >= 5000 && (data.gameMode === 'CHERRY' || data.killParticipation >= 40.0)) {
      add('challenge-healer.png', 'The Ambulance', 'achievement-HealsOnTeammates');
    }

    return achievements.join('\n');
  }


  buildCardContent(data: any): string {
    let firstLine: string;
    let secondLine: string;
    let thirdLine: string;

    if (data.gameMode === "CHERRY") {
      const csLabel = this.sanitizeImageTag(data.iconChampion, 'w-12 h-12', 'duoChampion');
      firstLine = this.buildFirstLine(data, csLabel);
      secondLine = this.buildSecondLine(data, `${data.timeCCingOthers}s CC`);
      thirdLine = this.buildThirdLine([
        `Damage <br> ${this.escapeHTML(data.totalDamageDealtToChampions?.toString())}`,
        `DamagePM ${this.escapeHTML(data.damagePerMinute?.toString())}`,
        `GoldPM ${this.escapeHTML(data.goldPerMinute?.toString())}`,
      ]);
    } else if (data.realRole === "sup") {
      firstLine = this.buildFirstLine(data, `${data.totalMinionsKilled} CS`);
      secondLine = this.buildSecondLine(data, `${data.timeCCingOthers}s CC`);
      thirdLine = this.buildThirdLine([
        `Damage <br> ${this.escapeHTML(data.totalDamageDealtToChampions?.toString())}`,
        `VisionScore <br> ${this.escapeHTML(data.visionScore?.toString())}`,
        `GoldPM ${this.escapeHTML(data.goldPerMinute?.toString())}`,
      ]);
    } else if (data.realRole === "jungle") {
      firstLine = this.buildFirstLine(data, `${data.totalMinionsKilledJg} CS`);
      secondLine = this.buildSecondLine(data, `${data.minionsPerMinuteJg} CSPM`);
      thirdLine = this.buildThirdLine([
        `Damage <br> ${this.escapeHTML(data.totalDamageDealtToChampions?.toString())}`,
        `DamagePM ${this.escapeHTML(data.damagePerMinute?.toString())}`,
        `GoldPM ${this.escapeHTML(data.goldPerMinute?.toString())}`,
      ]);
    } else {
      firstLine = this.buildFirstLine(data, `${data.totalMinionsKilled} CS`);
      secondLine = this.buildSecondLine(data, `${data.minionsPerMinute} CSPM`);
      thirdLine = this.buildThirdLine([
        `Damage <br> ${this.escapeHTML(data.totalDamageDealtToChampions?.toString())}`,
        `DamagePM ${this.escapeHTML(data.damagePerMinute?.toString())}`,
        `GoldPM ${this.escapeHTML(data.goldPerMinute?.toString())}`,
      ]);
    }

    return [firstLine, secondLine, thirdLine].join('');
  }

  buildCardBlocksSanitized(data: any): {
    stats: SafeHtml;
    runas: SafeHtml;
    spells: SafeHtml;
    items: SafeHtml;
    achievements: SafeHtml;
  } {
    return {
      stats: this.sanitizer.bypassSecurityTrustHtml(this.buildCardContent(data)),
      runas: this.sanitizer.bypassSecurityTrustHtml(this.runasCardContent(data)),
      spells: this.sanitizer.bypassSecurityTrustHtml(this.spellsCardContent(data)),
      items: this.sanitizer.bypassSecurityTrustHtml(this.itemsCardContent(data)),
      achievements: this.sanitizer.bypassSecurityTrustHtml(this.achievementsContent(data))
    };
  }

  buildFullCardSanitized(data: any): SafeHtml {
    const content = this.buildCardContent(data);
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

}

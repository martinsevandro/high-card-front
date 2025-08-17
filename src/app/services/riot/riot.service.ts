import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Card } from '../../models/card.model'; 
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({ providedIn: 'root' })
export class RiotService {
  private readonly API_URL = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  async getAccountByRiotId(name: string, tag: string, server: string): Promise<any> {
    return this.http.get(`${this.API_URL}/player/${name}/${tag}/${server}`).toPromise(); 
  }

  async getLatestMatchDetails(puuid: string, server: string): Promise<Card> { 
    const response = await firstValueFrom(
        this.http.get<Card>(`${this.API_URL}/matches/lol/latest/${puuid}/${server}`)
    );
    return response;
  }

  async getSpecificMatchDetails(puuid: string, server: string, matchId: string): Promise<Card> { 
    const response = await firstValueFrom(
        this.http.get<Card>(`${this.API_URL}/matches/lol/specific/${puuid}/${server}/${matchId}`)
    );
    return response;
  }

}

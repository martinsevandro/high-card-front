import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardsService {
  private readonly API = 'http://localhost:3000/cards';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyDeck(): Observable<Card[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Card[]>(`${this.API}/my-deck`, { headers });
  }

  saveCard(cardData: any): Observable<Card> {
    const headers = this.getAuthHeaders();
    return this.http.post<Card>(`${this.API}/save`, cardData, { headers });
  }

  deleteCard(cardId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.API}/${cardId}`, { headers });
  }
}

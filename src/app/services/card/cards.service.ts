import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../../models/card.model';
import { CreateCardDto } from '../../components/card/card-create.dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardsService {
  private readonly API = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyDeck(): Observable<Card[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Card[]>(`${this.API}/my-deck`, { headers });
  }

  saveCard(cardData: CreateCardDto): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.API}/save`, cardData, { headers });
  }

  deleteCard(cardId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.API}/${cardId}`, { headers });
  }
}

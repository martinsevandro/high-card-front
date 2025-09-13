import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  public backendReadySubject = new BehaviorSubject<boolean>(false);
  public backendReady$ = this.backendReadySubject.asObservable();

  private healthCheckUrl = `${environment.apiUrl}/api/health`;
  private isPollingActive = false;
  private pollingSubscription: any;

  constructor(private http: HttpClient) {}

  startPolling(intervalMs: number = 3000): void {
    if (this.isPollingActive || this.backendReadySubject.value) return;

    this.isPollingActive = true; 

    this.pollingSubscription = interval(intervalMs)
      .pipe(
        switchMap(() => this.checkHealth())
      )
      .subscribe(isHealthy => {
        if (isHealthy && !this.backendReadySubject.value) { 
          this.backendReadySubject.next(true);
          this.stopPolling();
        }
      });
  }

  private checkHealth(): Observable<boolean> {
    return this.http.get<{ status: string }>(this.healthCheckUrl).pipe(
      map(res => res.status === 'ok'),
      catchError(error => {
        console.log('Backend não respondeu:', error.message);
 
        this.backendReadySubject.next(false);

        return of(false);
      })
    );
  }

  stopPolling(): void {
    this.isPollingActive = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    } 
  }
}

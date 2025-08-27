import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { HealthService } from '../services/health/health.service';

@Injectable({
  providedIn: 'root'
})
export class BackendStatusGuard implements CanActivate {

  constructor(private healthService: HealthService) {}

  canActivate(): Observable<boolean> { 
    if (this.healthService.backendReadySubject.value) {
      return of(true);
    }

    this.healthService.startPolling();

    return this.healthService.backendReady$.pipe(
      filter(ready => ready),
      take(1),
      map(() => true)
    );
  }
}

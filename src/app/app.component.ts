import { Component, OnDestroy, OnInit } from '@angular/core';
import { delay, filter, Subject, takeUntil } from 'rxjs';
import { HealthService } from './services/health/health.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'high-card-front';

  backendReady = false;
  private destroy$ = new Subject<void>();

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.healthService.backendReady$
      .pipe(
        filter(ready => ready),
        delay(1000),
        takeUntil(this.destroy$))
      .subscribe(ready => {
        this.backendReady = ready;
      });

    this.healthService.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { HealthService } from '../../services/health/health.service';
import { Subject, takeUntil } from 'rxjs'; 
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-backend-loader',
  standalone: false,
  templateUrl: './backend-loader.component.html',   
  styleUrls: ['./backend-loader.component.css']
})
export class BackendLoaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public statusMessage = 'Verificando conexão com o servidor...';

  constructor(private healthService: HealthService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void { 
    this.healthService.startPolling();
     
    this.healthService.backendReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ready) => {
          if (ready) {
            this.statusMessage = 'Conexão estabelecida! Redirecionando...'; 

            const targetRoute = this.authService.isAuthenticated() ? '/home' : '/'; 
            this.router.navigateByUrl(targetRoute, { replaceUrl: true }); 

          } else { 
            this.statusMessage = 'Aguardando o servidor ficar disponível...';
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
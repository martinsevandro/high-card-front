import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DeckComponent } from './pages/deck/deck.component'; 
import { DuelComponent } from './pages/duel/duel.component'; 
import { BackendStatusGuard } from './guards/backend-status.guard';

const routes: Routes = [ 
  { path: '', component: HomeComponent, canActivate: [BackendStatusGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [BackendStatusGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BackendStatusGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard, BackendStatusGuard] },
  { path: 'deck', component: DeckComponent, canActivate: [AuthGuard, BackendStatusGuard] },
  { path: 'duel', component: DuelComponent, canActivate: [AuthGuard, BackendStatusGuard] },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

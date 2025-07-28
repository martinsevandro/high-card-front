import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { ReactiveFormsModule } from '@angular/forms';
import { CardContainerComponent } from './components/card-container/card-container.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DeckComponent } from './components/deck/deck.component';
import { DuelComponent } from './components/duel/duel.component';
import { HomeComponent } from './components/home/home.component'; 

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CardContainerComponent,
    RegisterComponent,
    LoginComponent,
    DeckComponent,
    DuelComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; 

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html', 
})
export class RegisterComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.auth.register({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.error = 'Erro ao registrar usuário. Verifique os dados e tente novamente.';
      }
    });
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (res) => {
          this.auth.saveToken(res.access_token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = 'Credenciais inválidas';
        },
      });
  }
}

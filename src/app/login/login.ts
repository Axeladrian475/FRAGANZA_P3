import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credenciales = {
    email: '',
    password: ''
  };

  mensajeError = '';

  login() {
    this.authService.login(this.credenciales).subscribe({
      next: () => {
        // Login exitoso
        // Aquí podrías redirigir al admin si el rol es 'admin'
        // Por ahora, mandamos a todos al catálogo
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = err.error?.message || 'Error al iniciar sesión. Verifica tus datos.';
      }
    });
  }
}
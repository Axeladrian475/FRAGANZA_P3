import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos del formulario
  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  mensajeError = '';

  registrar() {
    // Validar que no estén vacíos
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.password) {
      this.mensajeError = 'Por favor completa todos los campos.';
      return;
    }

    this.authService.registrar(this.usuario).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']); // Redirigir al login
      },
      error: (err) => {
        console.error(err);
        // Muestra el mensaje del backend si existe, o un genérico
        this.mensajeError = err.error?.message || 'Ocurrió un error al registrarse.';
      }
    });
  }
}
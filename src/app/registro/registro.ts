import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule], 
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  // Inyección de dependencias moderna (Signal-style)
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = {
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    password: ''
  };

  errorMessage: string = '';

  registrar() {
    // Validación local de seguridad
    if (this.usuario.password.length < 8) {
      this.errorMessage = 'La contraseña es muy corta (mínimo 8 caracteres).';
      return;
    }

    // Usamos tu AuthService aquí
    this.authService.registrar(this.usuario).subscribe({
      next: (res: any) => {
        alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // Manejo de errores que vienen del backend
        console.error('Error registro:', err);
        this.errorMessage = err.error?.message || 'Ocurrió un error al intentar registrarse.';
      }
    });
  }
}
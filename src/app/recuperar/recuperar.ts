import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class RecuperarComponent {
  private authService = inject(AuthService);
  
  email = '';
  mensaje = '';
  error = '';
  enviando = false;

  enviar() {
    if (!this.email) return;
    
    this.enviando = true;
    this.mensaje = '';
    this.error = '';

    this.authService.solicitarRecuperacion(this.email).subscribe({
      next: (res: any) => {
        this.mensaje = res.message; // "Correo enviado..."
        this.enviando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al solicitar recuperación.';
        this.enviando = false;
      }
    });
  }
}
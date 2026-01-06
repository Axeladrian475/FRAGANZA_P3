import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restablecer.html',
  styleUrls: ['./restablecer.css']
})
export class RestablecerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = '';
  password = '';
  mensaje = '';
  error = '';
  
  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  cambiarPassword() {
    if (!this.password || !this.token) return;

    this.authService.restablecerPassword(this.token, this.password).subscribe({
      next: (res: any) => {
        this.mensaje = '¡Contraseña actualizada correctamente!';
        setTimeout(() => this.router.navigate(['/login']), 3000); 
      },
      error: (err) => {
        this.error = err.error?.message || 'El enlace es inválido o ha expirado.';
      }
    });
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Usaremos template-driven forms por simplicidad
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = {
    nombre: '',
    email: ''
  };

  mensaje = '';
  error = '';

  ngOnInit() {
    // Cargar datos actuales del usuario
    const userLocal = this.authService.getUsuario();
    if (userLocal) {
      this.usuario.nombre = userLocal.nombre;
      this.usuario.email = userLocal.email;
    } else {
      this.router.navigate(['/login']);
    }
  }

  guardarCambios() {
    this.mensaje = '';
    this.error = '';

    this.authService.actualizarPerfil(this.usuario).subscribe({
      next: (res) => {
        this.mensaje = '¡Perfil actualizado con éxito!';
      },
      error: (err) => {
        this.error = err.error.message || 'Error al actualizar';
      }
    });
  }
}
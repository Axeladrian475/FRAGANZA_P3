// src/app/perfil/perfil.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Modelo completo para el formulario
  usuario = {
    nombre: '',
    apellido: '',
    username: '',
    email: ''
  };

  mensaje = '';
  error = '';
  cargando = false;

  ngOnInit() {
    const userLocal = this.authService.getUsuario();
    if (userLocal) {
      // Cargar datos en el formulario evitando valores 'undefined'
      this.usuario.nombre = userLocal.nombre || '';
      this.usuario.apellido = userLocal.apellido || '';
      this.usuario.username = userLocal.username || '';
      this.usuario.email = userLocal.email || '';
    } else {
      // Si no hay usuario, mandar al login
      this.router.navigate(['/login']);
    }
  }

  guardarCambios() {
    this.mensaje = '';
    this.error = '';
    this.cargando = true;

    // Enviamos el objeto usuario completo a actualizar
    this.authService.actualizarPerfil(this.usuario).subscribe({
      next: (res) => {
        this.mensaje = '¡Información actualizada con éxito!';
        this.cargando = false;
        // Opcional: Esto refresca la página para ver el cambio de nombre en el header
        // window.location.reload(); 
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'No se pudieron guardar los cambios. Intenta más tarde.';
        this.cargando = false;
      }
    });
  }
}
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();
  console.log('Intentando entrar a admin...');
  console.log('Usuario logueado:', usuario);
  console.log('Es admin según el servicio?:', authService.isAdmin());


  // Debe estar logueado Y ADEMÁS ser admin
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  } else {
    alert('Acceso denegado. Se requieren permisos de administrador.');
    router.navigate(['/catalogo']);
    return false;
  }
};
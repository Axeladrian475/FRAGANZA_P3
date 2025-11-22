import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito'; // 1. Importa el componente del carrito
import { RegistroComponent } from './registro/registro'; // IMPORTAR ESTO
import { LoginComponent } from './login/login'; // IMPORTAR
import { RecuperarComponent } from './recuperar/recuperar';      // NUEVO
import { RestablecerComponent } from './restablecer/restablecer'; // NUEVO
import { authGuard } from './guards/auth.guard';
import { AdminComponent } from './admin/admin'; // Importar
import { adminGuard } from './guards/auth.guard'; // Importar guard

export const routes: Routes = [
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  {
    path: '',
    redirectTo: '/catalogo', // La página de inicio sigue siendo el catálogo
    pathMatch: 'full'
  },

  // NUEVA RUTA:
  { path: 'registro', component: RegistroComponent },

  // (Opcional: Ruta login temporal para que no de error el enlace)
  { path: 'login', component: LoginComponent },
  // Rutas de recuperación
  { path: 'recuperar', component: RecuperarComponent },
  // Ruta dinámica que recibe el token (ej. /restablecer/abc123xyz)
  { path: 'restablecer/:token', component: RestablecerComponent },

  
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard] // <--- SOLO ADMINS PUEDEN ENTRAR
  },

  { path: '**', redirectTo: 'catalogo' }

];
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CarritoService } from './services/carrito';
import { CommonModule } from '@angular/common'; // 2. Importa CommonModule para *ngIf
import { AuthService } from './services/auth.service'; // 1. Importar AuthService

@Component({
  selector: 'app-root',
  // 3. Añade RouterLink y CommonModule a los imports
  imports: [RouterOutlet, RouterLink, CommonModule], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  
  private carritoService = inject(CarritoService);
  
  // 2. Inyectar AuthService y hacerlo público para el HTML
  public authService = inject(AuthService); 

  cantidadEnCarrito = computed(() => this.carritoService.productos().length);

  // 3. Método para cerrar sesión desde el menú
  logout() {
    this.authService.logout();
  }

}
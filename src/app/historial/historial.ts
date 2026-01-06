import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CarritoService } from '../services/carrito'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);

  // Usamos signal o variable normal para guardar los pedidos
  pedidos = signal<any[]>([]);
  loading = true;

  ngOnInit() {
    const usuario = this.authService.getUsuario();
    
    if (usuario && usuario.id) {
      this.carritoService.obtenerHistorial(usuario.id).subscribe({
        next: (data) => {
          this.pedidos.set(data);
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}
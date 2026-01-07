import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CarritoService } from '../services/carrito'; 

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

  pedidos = signal<any[]>([]);
  loading = true;

  ngOnInit() {
    const usuario = this.authService.getUsuario();
    
    if (usuario && usuario.id) {
      // Ahora 'obtenerHistorial' ya existe en el servicio
      this.carritoService.obtenerHistorial(usuario.id).subscribe({
        // Agregamos el tipo ': any' para corregir el error TS7006
        next: (data: any) => {
          this.pedidos.set(data);
          this.loading = false;
        },
        // Agregamos el tipo ': any' aquí también
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}
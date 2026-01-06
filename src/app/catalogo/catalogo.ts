import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../models/product';
// CORRECCIÓN 1: Nombre correcto del servicio (Plural)
import { ProductosService } from '../services/producto'; 
import { CarritoService } from '../services/carrito';
import { CarritoComponent } from '../carrito/carrito';
import { NgFor, AsyncPipe, NgIf, CurrencyPipe } from '@angular/common'; 
import { Observable } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgIf, CurrencyPipe], 
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css']
})
export class CatalogoComponent implements OnInit {
  // Nota: Asegúrate de que el tipo 'Product' coincida con lo que devuelve el servicio.
  // Si te da error de tipo más adelante, cambia 'Product' por 'any' temporalmente.
  productos$!: Observable<any[]>; 
  error: string | null = null;
  
  private carritoService = inject(CarritoService);

  // CORRECCIÓN 2: Inyectar ProductosService (Plural)
  constructor(private productoService: ProductosService) { }

  ngOnInit(): void {
    // CORRECCIÓN 3: Usar el método nuevo 'obtenerProductos()'
    this.productos$ = this.productoService.obtenerProductos();
    
    this.productos$.subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.message;
      }
    });
  }

  agregarAlCarrito(producto: any): void {
    this.carritoService.agregar(producto);
    console.log('Producto agregado al carrito:', producto.nombre);
  }

  onImageError(event: any): void {
    console.log('Error cargando imagen:', event.target.src);
    event.target.src = 'assets/images/placeholder.jpg'; // Ajusté la ruta por si acaso
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz para que TypeScript nos ayude con los errores
export interface Producto {
  id?: number;
  nombre: string;
  marca: string;
  precio: number;
  stock: number;
  imagen: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);
  // Asegúrate de que esta URL coincida con tu backend
  private apiUrl = 'http://localhost:4000/api/productos';

  // 1. OBTENER (Ya lo tenías)
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // 2. CREAR (Nuevo)
 crearProducto(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 3. ACTUALIZAR (Nuevo)
  actualizarProducto(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // 4. ELIMINAR (Nuevo)
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
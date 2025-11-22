import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../services/producto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  archivoSeleccionado: File | null = null;
  private productosService = inject(ProductosService);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }
  listaProductos: Producto[] = [];

  productoActual: Producto = this.iniciarProductoVacio();

  modoEdicion = false; 

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.obtenerProductos().subscribe({
      next: (data) => this.listaProductos = data,
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  nuevoProducto() {
    this.modoEdicion = false;
    this.productoActual = this.iniciarProductoVacio();
  }

  editarProducto(producto: Producto) {
    this.modoEdicion = true;

    this.productoActual = { ...producto };
  }


  guardar() {
    const formData = new FormData();
    formData.append('nombre', this.productoActual.nombre);
    formData.append('marca', this.productoActual.marca);
    formData.append('precio', this.productoActual.precio.toString());
    formData.append('stock', this.productoActual.stock.toString());
    formData.append('descripcion', this.productoActual.descripcion || '');

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    } else {
      if (this.productoActual.imagen) {
        formData.append('imagen', this.productoActual.imagen);
      }
    }

    if (this.modoEdicion && this.productoActual.id) {
      this.productosService.actualizarProducto(this.productoActual.id, formData).subscribe({
        next: () => {
          alert('Actualizado con éxito');
          this.cargarProductos();
          this.nuevoProducto();
          this.archivoSeleccionado = null; 
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.productosService.crearProducto(formData).subscribe({
        next: () => {
          alert('Creado con éxito');
          this.cargarProductos();
          this.nuevoProducto();
          this.archivoSeleccionado = null;
        },
        error: () => alert('Error al crear')
      });
    }
  }
  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productosService.eliminarProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (err) => alert('Error al eliminar')
      });
    }
  }

  cancelar() {
    this.nuevoProducto();
  }

  private iniciarProductoVacio(): Producto {
    return { nombre: '', marca: '', precio: 0, stock: 0, imagen: '', descripcion: '' };
  }
}
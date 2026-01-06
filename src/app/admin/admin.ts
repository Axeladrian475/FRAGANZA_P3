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
    this.archivoSeleccionado = null; // Limpiamos la selección de archivo
  }

  editarProducto(producto: Producto) {
    this.modoEdicion = true;
    this.productoActual = { ...producto };
    this.archivoSeleccionado = null; // Resetear archivo al editar
  }

  guardar() {
    // --- VALIDACIÓN FRONTEND ---
    if (
      !this.productoActual.nombre?.trim() || 
      !this.productoActual.marca?.trim() || 
      !this.productoActual.descripcion?.trim() ||
      this.productoActual.precio <= 0 || 
      this.productoActual.stock < 0
    ) {
      alert('Por favor, llena todos los campos correctamente. El precio debe ser mayor a 0.');
      return;
    }

    // Si es NUEVO y no hay imagen seleccionada, error.
    if (!this.modoEdicion && !this.archivoSeleccionado) {
      alert('Es obligatorio seleccionar una imagen para crear un producto.');
      return;
    }
    // ---------------------------

    const formData = new FormData();
    formData.append('nombre', this.productoActual.nombre);
    formData.append('marca', this.productoActual.marca);
    formData.append('precio', this.productoActual.precio.toString());
    formData.append('stock', this.productoActual.stock.toString());
    formData.append('descripcion', this.productoActual.descripcion || '');

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    } else {
      // En edición, si no seleccionó nueva imagen, mantenemos la ruta anterior si existe
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
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.productosService.crearProducto(formData).subscribe({
        next: () => {
          alert('Creado con éxito');
          this.cargarProductos();
          this.nuevoProducto();
        },
        error: (err) => {
          console.error(err);
          // Muestra el mensaje de error que enviamos desde el backend (status 400)
          alert(err.error?.error || 'Error al crear');
        }
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
import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';

interface ProductoConCantidad {
  producto: Product;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Product[]>([]);
  productos = this.productosSignal.asReadonly();
  
  // Tasa de IVA
  private readonly IVA_RATE = 0.16;

  subtotal(): number {
    return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
  }

  
  iva(): number {
    return this.subtotal() * this.IVA_RATE;
  }

  
  total(): number {
    return this.subtotal() + this.iva();
  }

  agregar(producto: Product) {
    const cantidadEnCarrito = this.productos().filter(p => p.id === producto.id).length;
    if (cantidadEnCarrito >= producto.stock) {
      alert(`No puedes agregar más unidades de "${producto.nombre}". Stock máximo alcanzado.`);
      return;
    }
    const productoCorregido = { ...producto, precio: Number(producto.precio) };
    this.productosSignal.update(lista => [...lista, productoCorregido]);
  }

  quitar(id: number) {
    this.productosSignal.update(lista => lista.filter(p => p.id !== id));
  }

  vaciar() {
    this.productosSignal.set([]);
  }

  obtenerProductosConCantidad(): ProductoConCantidad[] {
    const productos = this.productosSignal();
    const productosConCantidad: { [id: number]: ProductoConCantidad } = {};
    productos.forEach(p => {
      if (productosConCantidad[p.id]) {
        productosConCantidad[p.id].cantidad++;
      } else {
        productosConCantidad[p.id] = { producto: p, cantidad: 1 };
      }
    });
    return Object.values(productosConCantidad);
  }

  // === MÉTODO XML MODIFICADO ===
  exportarXML(productos: ProductoConCantidad[], subtotal: number, iva: number, total: number, transaccionId: string) {
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('es-MX');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <transaccion_id>${transaccionId}</transaccion_id>\n`;
    xml += `  <fecha>${fecha}</fecha>\n`;
    xml += `  <hora>${hora}</hora>\n`;
    xml += `  <tienda>Fraganza - Perfumería</tienda>\n`;
    xml += `  <productos>\n`;

    for (const item of productos) {
      const p = item.producto;
      xml += `    <producto>\n`;
      xml += `      <id>${p.id}</id>\n`;
      xml += `      <nombre>${this.escapeXML(p.nombre)}</nombre>\n`;
      xml += `      <precio_unitario>${p.precio}</precio_unitario>\n`;
      xml += `      <cantidad>${item.cantidad}</cantidad>\n`;
      xml += `      <subtotal>${(p.precio * item.cantidad).toFixed(2)}</subtotal>\n`;
      xml += `    </producto>\n`;
    }

    xml += `  </productos>\n`;
    xml += `  <resumen_pago>\n`; // <-- Nuevo nodo para el desglose
    xml += `    <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `    <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `    <total>${total.toFixed(2)}</total>\n`;
    xml += `  </resumen_pago>\n`;
    xml += `  <articulos_totales>${productos.reduce((sum, item) => sum + item.cantidad, 0)}</articulos_totales>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_fraganza_${transaccionId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeXML(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
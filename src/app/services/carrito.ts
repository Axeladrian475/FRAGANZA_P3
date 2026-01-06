import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';

interface ProductoConCantidad {
  producto: Product;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  
  // CORREGIDO: Usamos la misma ruta base que usas para PayPal en el backend
  private apiUrl = 'http://localhost:4000/api/orders'; 

  private productosSignal = signal<Product[]>([]);
  productos = this.productosSignal.asReadonly();
  
  private readonly IVA_RATE = 0.16;

  subtotal(): number {
    return this.productosSignal().reduce((acc, p) => acc + Number(p.precio), 0);
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
    const mapa = new Map<number, ProductoConCantidad>();
    this.productos().forEach(prod => {
      if (mapa.has(prod.id)) {
        mapa.get(prod.id)!.cantidad++;
      } else {
        mapa.set(prod.id, { producto: prod, cantidad: 1 });
      }
    });
    return Array.from(mapa.values());
  }

  // --- LÓGICA DE GUARDADO ---
  
  // Preparamos los datos limpios para la BD
  private agruparParaBackend(lista: Product[]) {
    const mapa = new Map();
    lista.forEach(p => {
      if (!mapa.has(p.id)) {
        mapa.set(p.id, { 
          id: p.id, 
          precio: Number(p.precio), 
          cantidad: 0 
        });
      }
      mapa.get(p.id).cantidad++;
    });
    return Array.from(mapa.values());
  }

  guardarPedidoEnBD(usuarioId: number) {
    const productosAgrupados = this.agruparParaBackend(this.productosSignal());
    
    const datosPedido = {
      usuario_id: usuarioId,
      total: this.total(), // Enviamos el total CON IVA
      productos: productosAgrupados
    };

    // Esto hará POST a http://localhost:4000/api/orders/
    return this.http.post(this.apiUrl, datosPedido);
  }

  // --- XML ---
  escapeXML(str: string): string {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  generarReciboXML() {
    const productos = this.obtenerProductosConCantidad();
    const subtotal = this.subtotal();
    const iva = this.iva();
    const total = this.total();
    const fecha = new Date().toLocaleDateString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <fecha>${fecha}</fecha>\n  <tienda>Fraganza</tienda>\n  <productos>\n`;

    for (const item of productos) {
      xml += `    <producto>\n`;
      xml += `      <nombre>${this.escapeXML(item.producto.nombre)}</nombre>\n`;
      xml += `      <cantidad>${item.cantidad}</cantidad>\n`;
      xml += `      <precio_unitario>${item.producto.precio}</precio_unitario>\n`;
      xml += `      <subtotal>${(item.producto.precio * item.cantidad).toFixed(2)}</subtotal>\n`;
      xml += `    </producto>\n`;
    }
    
    xml += `  </productos>\n  <resumen>\n`;
    xml += `    <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `    <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `    <total>${total.toFixed(2)}</total>\n`;
    xml += `  </resumen>\n</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_fraganza_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
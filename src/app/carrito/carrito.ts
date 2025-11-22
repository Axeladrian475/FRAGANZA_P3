import { Component, computed, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../services/carrito';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgxPayPalModule, IOnApproveCallbackData } from 'ngx-paypal';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, NgxPayPalModule],
  templateUrl: 'carrito.html',
  styleUrls: ['carrito.css']
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);

  carrito = this.carritoService.productos;
  productosConCantidad = computed(() => this.carritoService.obtenerProductosConCantidad());
  
  
  subtotal = computed(() => this.carritoService.subtotal());
  iva = computed(() => this.carritoService.iva());
  total = computed(() => this.carritoService.total());

  public payPalConfig?: any;

  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'MXN',
      clientId: 'Aa926d9SPXMrJB-1NmJWP6NjQyvTR2IRX-ed39gGa29inrex5dDeV8Evk2VsBYZpMWnu2OxC2uPMdGAu',
      createOrderOnServer: (data: any) => {
        const body = {
          productos: this.productosConCantidad()
        };
        // Nota: El backend recalculará el total con IVA por seguridad
        return this.http.post<{ id: string }>('http://localhost:4000/api/orders/create-order', body)
          .toPromise()
          .then(order => {
            if (order) return order.id;
            throw new Error("No se pudo obtener el ID de la orden del servidor.");
          })
          .catch(err => {
            alert(`Error al crear la orden: ${err.error}`);
            throw err;
          });
      },
      onApprove: (data: IOnApproveCallbackData, actions: any) => {
        const body = {
          orderID: data.orderID,
          productos: this.productosConCantidad()
        };
        this.http.post('http://localhost:4000/api/orders/capture-order', body).subscribe({
          next: (details: any) => {
            alert('¡Pago completado con éxito! Gracias por tu compra. Se descargará tu recibo.');

            // Obtenemos los datos ANTES de vaciar el carrito
            const productosParaRecibo = this.productosConCantidad();
            const subtotalRecibo = this.subtotal();
            const ivaRecibo = this.iva();
            const totalRecibo = this.total();
            
          
            this.carritoService.exportarXML(productosParaRecibo, subtotalRecibo, ivaRecibo, totalRecibo, data.orderID);

            this.carritoService.vaciar();
          },
          error: (err: any) => {
            console.error('Error al capturar la orden', err);
            alert('Hubo un problema al confirmar tu pago. Por favor, contacta a soporte.');
          }
        });
      },
      onError: (err: any) => {
        console.log('OnError', err);
        alert('PayPal encontró un error. Por favor, intenta de nuevo.');
      },
      onCancel: (data: any, actions: any) => {
        console.log('OnCancel', data, actions);
      },
    };
  }

  quitar(id: number) { this.carritoService.quitar(id); }
  vaciar() { this.carritoService.vaciar(); }
}
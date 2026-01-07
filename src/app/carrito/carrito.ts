import { Component, computed, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router'; 
import { CurrencyPipe, CommonModule } from '@angular/common'; 
import { NgxPayPalModule, IOnApproveCallbackData } from 'ngx-paypal';

import { CarritoService } from '../services/carrito';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, NgxPayPalModule, CommonModule],
  templateUrl: 'carrito.html',
  styleUrls: ['carrito.css']
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals
  carrito = this.carritoService.productos;
  productosConCantidad = computed(() => this.carritoService.obtenerProductosConCantidad());
  
  subtotal = computed(() => this.carritoService.subtotal());
  iva = computed(() => this.carritoService.iva());
  total = computed(() => this.carritoService.total());

  public payPalConfig?: any;

  ngOnInit(): void {
    this.initConfig();
  }

  // --- NUEVAS FUNCIONES PARA LOS BOTONES ---
  aumentar(producto: any) {
    this.carritoService.aumentarCantidad(producto);
  }

  disminuir(productoId: number) {
    this.carritoService.disminuirCantidad(productoId);
  }
  // ----------------------------------------

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  private initConfig(): void {
    const usuario = this.authService.getUsuario(); 

    this.payPalConfig = {
      currency: 'MXN',
      clientId: 'Aa926d9SPXMrJB-1NmJWP6NjQyvTR2IRX-ed39gGa29inrex5dDeV8Evk2VsBYZpMWnu2OxC2uPMdGAu',
      
      createOrderOnServer: (data: any) => {
        if (!usuario || !usuario.id) {
            alert('Por favor inicia sesión para continuar.');
            this.router.navigate(['/login']);
            return Promise.reject('No user');
        }
        
        const body = { productos: this.productosConCantidad() };
        
        return this.http.post('http://localhost:4000/api/orders/create-order', body)
          .toPromise()
          .then((order: any) => order.id)
          .catch((err) => {
            console.error('Error create-order:', err);
            alert('Error al iniciar PayPal.');
            throw err;
          });
      },

      onApprove: (data: IOnApproveCallbackData, actions: any) => {
        const body = { orderID: data.orderID };

        this.http.post('http://localhost:4000/api/orders/capture-order', body).subscribe({
          next: (details: any) => {
            console.log('Pago PayPal exitoso.');
            
            const usuarioLogueado = this.authService.getUsuario();
            if (usuarioLogueado && usuarioLogueado.id) {
                
                this.carritoService.guardarPedidoEnBD(usuarioLogueado.id).subscribe({
                    next: (resBD) => {
                        console.log('Pedido guardado:', resBD);
                        alert('¡Compra exitosa! Se descargará tu recibo.');
                        this.carritoService.generarReciboXML();
                        this.carritoService.vaciar();
                        this.router.navigate(['/catalogo']);
                    },
                    error: (errBD) => {
                        console.error('Error BD:', errBD);
                        alert('Pago procesado, pero error al guardar historial.');
                    }
                });
            }
          },
          error: (err) => {
            console.error('Error captura:', err);
            alert('Error al procesar el pago final.');
          }
        });
      },
      onError: (err: any) => console.log('PayPal Error:', err),
      onCancel: (data: any) => console.log('Pago cancelado')
    };
  }
}
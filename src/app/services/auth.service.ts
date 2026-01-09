// src/app/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // URL de tu backend (asegúrate de que coincida con tu puerto)
    private apiUrl = 'http://localhost:4000/api/auth';

    // Claves para guardar en el navegador
    private tokenKey = 'auth_token';
    private userKey = 'usuario_fraganza'; // Unificamos la clave

    // Signal para saber reactivamente si está logueado
    isLoggedIn = signal<boolean>(this.hasToken());

    constructor() { }

    // --- REGISTRO ---
    registrar(datos: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, datos);
    }

    // --- LOGIN ---
    login(credenciales: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
            tap(response => {
                if (response.token) {
                    this.guardarSesion(response.token, response.usuario);
                }
            })
        );
    }

    // --- ACTUALIZAR PERFIL (Con Token) ---
    actualizarPerfil(datos: any): Observable<any> {
        const token = this.getToken();
        // Creamos headers con el token Authorization
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.put(`${this.apiUrl}/perfil`, datos, { headers }).pipe(
            tap((res: any) => {
                if (res.usuario) {
                    // Actualizamos el usuario en localStorage automáticamente
                    this.actualizarUsuarioLocal(res.usuario);
                }
            })
        );
    }

    // --- RECUPERACIÓN DE CONTRASEÑA ---
    solicitarRecuperacion(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/recuperar`, { email });
    }

    restablecerPassword(token: string, nuevoPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/restablecer`, { token, nuevoPassword });
    }

    // --- MANEJO DE SESIÓN Y TOKENS ---

    private guardarSesion(token: string, usuario: any) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(usuario));
        this.isLoggedIn.set(true);
    }

    private actualizarUsuarioLocal(usuarioNuevo: any) {
        // Obtenemos los datos viejos para no perder info (como el rol)
        const usuarioActual = this.getUsuario();
        const usuarioActualizado = { ...usuarioActual, ...usuarioNuevo };
        localStorage.setItem(this.userKey, JSON.stringify(usuarioActualizado));
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.isLoggedIn.set(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getUsuario() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    isAdmin(): boolean {
        const user = this.getUsuario();
        return user && user.rol === 'admin';
    }
}
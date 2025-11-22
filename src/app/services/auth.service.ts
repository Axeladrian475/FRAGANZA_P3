// src/app/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // URL de tu backend
    private apiUrl = 'http://localhost:4000/api/auth';

    // Claves para guardar en el navegador
    private tokenKey = 'auth_token';
    private userKey = 'auth_user';

    // Signal para saber reactivamente si está logueado (útil para el menú)
    isLoggedIn = signal<boolean>(this.hasToken());

    // --- REGISTRO ---
    registrar(datos: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, datos);
    }

    // --- LOGIN ---
    login(credenciales: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
            tap(response => {
                if (response.token) {
                    // Guardamos el token y el usuario en localStorage
                    localStorage.setItem(this.tokenKey, response.token);
                    localStorage.setItem(this.userKey, JSON.stringify(response.usuario));

                    // Actualizamos la señal
                    this.isLoggedIn.set(true);
                }
            })
        );
    }

    // --- LOGOUT ---
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.isLoggedIn.set(false);
        this.router.navigate(['/login']);
    }

    // --- UTILIDADES ---

    // Verifica si existe un token guardado
    private hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    // Obtiene el token actual (para enviarlo en peticiones futuras)
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    // Obtiene los datos del usuario (nombre, email, rol)
    getUsuario(): any {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Verifica si es administrador
    isAdmin(): boolean {
        const usuario = this.getUsuario();
        return usuario && usuario.rol === 'admin';
    }

    // 1. Enviar correo de recuperación
    solicitarRecuperacion(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/recuperar`, { email });
    }

    // 2. Enviar nueva contraseña con el token
    restablecerPassword(token: string, nuevoPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/restablecer`, { token, nuevoPassword });
    }

}
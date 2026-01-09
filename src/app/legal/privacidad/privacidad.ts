import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad.html',
  styleUrls: ['../terminos/terminos.css'] // Reusamos el CSS del otro componente para que se vean igual
})
export class PrivacidadComponent {}
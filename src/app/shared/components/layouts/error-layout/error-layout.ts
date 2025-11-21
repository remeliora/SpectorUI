import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-error-layout',
  imports: [
    RouterOutlet
  ],
  templateUrl: './error-layout.html',
  styleUrl: './error-layout.scss'
})
export class ErrorLayout {
  // === SERVICES ===
  private readonly router = inject(Router);

  // === МЕТОДЫ ===
  onGoHome(): void {
    this.router.navigate(['/']);
  }
}

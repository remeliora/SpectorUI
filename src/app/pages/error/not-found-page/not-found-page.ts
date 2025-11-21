import {Component, inject} from '@angular/core';
import {SvgIcon} from '../../../shared/components/svg-icon/svg-icon';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';

@Component({
  selector: 'app-not-found-page',
  imports: [
    SvgIcon
  ],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss'
})
export class NotFoundPage {
  // === SERVICES ===
  private readonly router = inject(Router);

  // === МЕТОДЫ ===
  onGoBack(): void {
    window.history.back();
  }

  onGoHome(): void {
    this.router.navigate(['/']);
  }
}

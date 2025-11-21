import {Component, inject} from '@angular/core';
import {SvgIcon} from '../../../shared/components/svg-icon/svg-icon';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [
    SvgIcon
  ],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss'
})
export class ErrorPage {
  // === SERVICES ===
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // === INPUTS ===
  errorCode = this.route.snapshot.queryParamMap.get('code') || '500';
  errorTitle = this.getErrorTitle(this.errorCode);
  errorMessage = this.getErrorMessage(this.errorCode);

  // === МЕТОДЫ ===
  private getErrorTitle(code: string): string {
    switch (code) {
      case '500': return 'Упс!';
      case '502': return 'Сервер недоступен';
      case '503': return 'Перегрузка!';
      case '504': return 'Время истекло!';
      default: return 'Ошибка';
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case '500': return 'Что-то пошло не так на сервере';
      case '502': return 'Сервер временно недоступен. Попробуйте позже.';
      case '503': return 'Сервис временно перегружен. Попробуйте позже.';
      case '504': return 'Сервер не отвечает. Попробуйте позже.';
      default: return 'Произошла ошибка. Попробуйте позже.';
    }
  }

  onRefresh(): void {
    window.history.back();
  }

  onGoHome(): void {
    this.router.navigate(['/']);
  }
}

import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {ButtonAdd} from "../../shared/components/buttons/button-add/button-add";
import {PageBodyDirective} from "../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../data/services/page-label-directive";
import {PageLayout} from "../../shared/components/layouts/page-layout/page-layout";
import {Card} from '../../shared/components/card/card';
import {ListOfCardsLayout} from '../../shared/components/layouts/list-of-cards-layout/list-of-cards-layout';
import {EnumerationService} from '../../data/services/enumeration-service';
import {EnumerationCard} from '../../data/services/interfaces/enumeration/enumeration-card';
import {Subject, takeUntil} from 'rxjs';
import {EmptyLayout} from '../../shared/components/layouts/empty-layout/empty-layout';

@Component({
  selector: 'app-enumeration-page',
  imports: [
    ButtonAdd,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    Card,
    ListOfCardsLayout,
    EmptyLayout
  ],
  templateUrl: './enumeration-page.html',
  styleUrl: './enumeration-page.scss'
})
export class EnumerationPage implements OnInit, OnDestroy {
  // === SERVICES ===
  private readonly enumerationService = inject(EnumerationService);
  private navbarService = inject(NavbarService);
  private readonly destroy$ = new Subject<void>();

  // === STATES ===
  enumerationCards: EnumerationCard[] = [];

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  ngOnInit(): void {
    this.navbarService.setConfig({
      showMainLinks: true
    });

    // Загружаем данные
    this.enumerationService.getEnumeratedStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.enumerationCards = value;
        },
        error: (error) => {
          console.error('Error loading enumerations:', error);
          // Можно установить enumerationCards в [], если нужно
          this.enumerationCards = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}

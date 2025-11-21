import {Component, DestroyRef, inject, signal} from '@angular/core';
import {ButtonAdd} from '../../../shared/components/buttons/button-add/button-add';
import {Card} from '../../../shared/components/card/card';
import {EmptyLayout} from '../../../shared/components/layouts/empty-layout/empty-layout';
import {ListOfCardsLayout} from '../../../shared/components/layouts/list-of-cards-layout/list-of-cards-layout';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {NavbarService} from '../../../data/services/navbar-service';
import {ActivatedRoute} from '@angular/router';
import {StatusDictionaryCard} from '../../../data/services/interfaces/status-dictionary/status-dictionary-card';

@Component({
  selector: 'app-status-dictionary-page',
  imports: [
    ButtonAdd,
    Card,
    EmptyLayout,
    ListOfCardsLayout,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout
  ],
  templateUrl: './status-dictionary-page.html',
  styleUrl: './status-dictionary-page.scss'
})
export class StatusDictionaryPage {
  // === SERVICES ===
  private readonly navbarService = inject(NavbarService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  statusDictionaryCards = signal<StatusDictionaryCard[]>([]);

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.statusDictionaryCards.set(this.route.snapshot.data['statusDictionaryCards'] || []);
    this.navbarService.setConfig({
      showMainLinks: true
    });
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }
}

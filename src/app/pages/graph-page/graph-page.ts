import {Component, DestroyRef, inject} from '@angular/core';
import {PageBodyDirective} from '../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../data/services/page-label-directive';
import {PageLayout} from '../../shared/components/layouts/page-layout/page-layout';
import {DatePickerManual} from '../../shared/components/date-pickers/date-picker-manual/date-picker-manual';
import {DatePickerAuto} from '../../shared/components/date-pickers/date-picker-auto/date-picker-auto';
import {ButtonCreate} from '../../shared/components/buttons/button-create/button-create';
import {ListOfTablesLayout} from '../../shared/components/layouts/list-of-tables-layout/list-of-tables-layout';
import {GraphChart} from '../../shared/components/graph-chart/graph-chart';
import {GraphStateService} from '../../data/services/graph-state-service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-graph-page',
  imports: [
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    DatePickerManual,
    DatePickerAuto,
    ButtonCreate,
    ListOfTablesLayout,
    GraphChart
  ],
  templateUrl: './graph-page.html',
  styleUrl: './graph-page.scss'
})
export class GraphPage {
  private readonly graphStateService = inject(GraphStateService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Подписка на requestChange$ была удалена из GraphStateService и больше не нужна здесь.
    // Логика обновления графика теперь находится в GraphChart, который подписывается на сигнал buildRequest.

    // Добавляем сброс состояния при уничтожении компонента
    this.destroyRef.onDestroy(() => {
      console.log('GraphPage: Компонент уничтожается, сбрасываем состояние GraphStateService');
      this.graphStateService.resetState(); // <-- Вызываем метод сброса
    });
  }
}

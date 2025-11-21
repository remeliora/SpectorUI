import {Component, inject} from '@angular/core';
import {SvgIcon} from "../../svg-icon/svg-icon";
import {GraphStateService} from '../../../../data/services/graph-state-service';

@Component({
  selector: 'app-button-create',
  imports: [
    SvgIcon
  ],
  templateUrl: './button-create.html',
  styleUrl: './button-create.scss'
})
export class ButtonCreate {
  private readonly graphStateService = inject(GraphStateService);

  onClick(): void {
    // console.log('Кнопка "Построить" нажата');
    this.graphStateService.buildChart();
  }
}

import {computed, Injectable, signal} from '@angular/core';
import {ChartDataRequest} from './interfaces/graph/chart-data-request';
import {DeviceParameterRequest} from './interfaces/graph/device-parameter-request';
import {Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GraphStateService {
  // Храним выбор параметров
  private readonly _selectedDeviceParameters = signal<DeviceParameterRequest[]>([]);

  // Сигналы для временных диапазонов
  private readonly _manualTimeRange = signal<{ from: Date | null, to: Date | null }>({from: null, to: null});
  private readonly _autoTimeRange = signal<{ value: number, unit: 'hour' | 'day' | 'month' | 'year' }>({
    value: 1,
    unit: 'hour'
  });
  private readonly _timeRangeType = signal<'manual' | 'auto'>('auto');

  // Subject для уведомления о событии построения графика
  private readonly buildChartTrigger$ = new Subject<ChartDataRequest>();

  // Публичный Observable для подписки на событие построения
  readonly buildChart$ = this.buildChartTrigger$.asObservable();

  // Публичные сигналы (без lastBuildRequest)
  readonly selectedDeviceParameters = this._selectedDeviceParameters.asReadonly();
  readonly manualTimeRange = this._manualTimeRange.asReadonly();
  readonly autoTimeRange = this._autoTimeRange.asReadonly();
  readonly timeRangeType = this._timeRangeType.asReadonly();

  // Вычисляемый сигнал для текущего временного диапазона (остаётся без изменений)
  readonly currentTimeRange = computed(() => {
    const type = this._timeRangeType();
    if (type === 'manual') {
      return this._manualTimeRange();
    } else {
      const autoRange = this._autoTimeRange();
      const now = new Date();
      let from: Date;

      switch (autoRange.unit) {
        case 'hour':
          from = new Date(now.getTime() - autoRange.value * 60 * 60 * 1000);
          break;
        case 'day':
          from = new Date(now.getTime() - autoRange.value * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          from = new Date(now.getFullYear(), now.getMonth() - autoRange.value, now.getDate());
          break;
        case 'year':
          from = new Date(now.getFullYear() - autoRange.value, now.getMonth(), now.getDate());
          break;
        default:
          from = new Date(now.getTime() - autoRange.value * 60 * 60 * 1000);
      }

      return {from, to: now};
    }
  });

  // Методы для обновления выбора остаются без изменений
  updateDeviceParameterSelection(selection: DeviceParameterRequest[]): void {
    const filteredSelection = selection.filter(dp => dp.parameterIds.length > 0);
    this._selectedDeviceParameters.set(filteredSelection);
  }

  //
  // updateDeviceSelection(deviceId: number, parameterIds: number[]): void {
  //   const currentSelection = this._selectedDeviceParameters();
  //   const existingIndex = currentSelection.findIndex(dp => dp.deviceId === deviceId);
  //
  //   let newSelection: DeviceParameterRequest[];
  //   if (parameterIds.length > 0) {
  //     if (existingIndex >= 0) {
  //       newSelection = [...currentSelection];
  //       newSelection[existingIndex] = {deviceId, parameterIds};
  //     } else {
  //       newSelection = [...currentSelection, {deviceId, parameterIds}];
  //     }
  //   } else {
  //     if (existingIndex >= 0) {
  //       newSelection = currentSelection.filter((_, index) => index !== existingIndex);
  //     } else {
  //       newSelection = currentSelection;
  //     }
  //   }
  //
  //   this._selectedDeviceParameters.set(newSelection);
  // }

  // Метод построения графика - формирует и отправляет запрос через Subject
  buildChart(): void {
    console.log('GraphStateService: вызван buildChart');
    const request = this.getCurrentRequest();
    if (request) {
      console.log('GraphStateService: отправляем запрос на построение:', request);
      this.buildChartTrigger$.next(request); // <-- Отправляем запрос
    } else {
      console.log('GraphStateService: buildChart вызван, но запрос недействителен (null)');
      // Можно отправить null или специальный сигнал, если нужно уведомить о "очистке"
      // this.buildChartTrigger$.next(null);
    }
  }

  // Метод для получения запроса без автоматического срабатывания
  private getCurrentRequest(): ChartDataRequest | null {
    const deviceParams = this._selectedDeviceParameters();
    const timeRange = this.currentTimeRange();

    if (deviceParams.length === 0 || !timeRange.from || !timeRange.to) {
      return null;
    }

    const devicesRequest: DeviceParameterRequest[] = deviceParams.filter(
      dp => dp.parameterIds.length > 0
    );

    if (devicesRequest.length === 0) {
      return null;
    }

    return {
      devices: devicesRequest,
      from: timeRange.from.toISOString(),
      to: timeRange.to.toISOString()
    };
  }

  // Методы для работы с временными диапазонами остаются без изменений
  updateManualTimeRange(from: Date | null, to: Date | null): void {
    this._manualTimeRange.set({from, to});
    this._timeRangeType.set('manual');
  }

  updateAutoTimeRange(value: number, unit: 'hour' | 'day' | 'month' | 'year'): void {
    this._autoTimeRange.set({value, unit});
    this._timeRangeType.set('auto');
  }

  // setTimeRangeType(type: 'manual' | 'auto'): void {
  //   this._timeRangeType.set(type);
  // }

  // Метод для сброса всего состояния к начальному
  resetState(): void {
    this._selectedDeviceParameters.set([]);
    this._manualTimeRange.set({from: null, to: null});
    this._autoTimeRange.set({value: 1, unit: 'hour'});
    this._timeRangeType.set('auto');
    // this._lastBuildRequest.set(null); // <-- Больше не нужно
    console.log('GraphStateService: Состояние сброшено');
    // Опционально: уведомить GraphChart о сбросе
    // this.buildChartTrigger$.next(null); // <-- Если нужно уведомить о сбросе
  }
}

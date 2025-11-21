import {Component, effect, EventEmitter, inject, Input, Output, signal, WritableSignal} from '@angular/core';
import {DeviceWithActiveParameters} from '../../../../data/services/interfaces/graph/device-with-active-parameters';
import {GraphStateService} from '../../../../data/services/graph-state-service';
import {DeviceParameterRequest} from '../../../../data/services/interfaces/graph/device-parameter-request';

// Новый интерфейс для параметра с уникальным ключом
interface UniqueParameter {
  id: number;
  name: string;
  description: string;
  uniqueKey: string;
}

interface TransformedDeviceWithActiveParameters {
  id: number;
  name: string;
  ipAddress: string;
  parameters: UniqueParameter[];
}

@Component({
  selector: 'app-multi-list-select',
  imports: [],
  templateUrl: './multi-list-select.html',
  styleUrl: './multi-list-select.scss'
})
export class MultiListSelect {
  private readonly graphStateService = inject(GraphStateService);

  @Input() set devices(value: DeviceWithActiveParameters[]) {
    // Преобразуем входные данные, добавляя uniqueKey к каждому параметру
    this.transformedDevices.set(
      value.map(device => ({
        ...device,
        parameters: device.parameters.map(param => ({
          ...param,
          uniqueKey: `${device.id}_${param.id}`
        }))
      }))
    );
  }

  // Сигнал для хранения преобразованных устройств
  transformedDevices: WritableSignal<TransformedDeviceWithActiveParameters[]> = signal([]);

  @Output() selectionChange = new EventEmitter<DeviceParameterRequest[]>();

  // Теперь это сигнал, содержащий Map
  deviceParameterMap = signal<Map<number, Set<number>>>(new Map()); // deviceId -> Set<parameterId>
  visibleParameters = signal(new Set<number>()); // Также делаем сигналом для единообразия

  constructor() {
    // Подписываемся на изменения состояния из сервиса через effect
    effect(() => {
      const currentSelection = this.graphStateService.selectedDeviceParameters();
      // Создаём новый Map, чтобы гарантировать изменение сигнала
      const newMap = new Map<number, Set<number>>();
      currentSelection.forEach(dp => {
        newMap.set(dp.deviceId, new Set(dp.parameterIds));
      });
      // Обновляем сигнал
      this.deviceParameterMap.set(newMap);
    });
  }

  isDeviceActive(deviceId: number): boolean {
    return this.visibleParameters().has(deviceId);
  }

  toggleDeviceParameters(deviceId: number, event: Event) {
    event.stopPropagation();
    const currentSet = this.visibleParameters();
    const newSet = new Set(currentSet);
    if (newSet.has(deviceId)) {
      newSet.delete(deviceId);
    } else {
      newSet.add(deviceId);
    }
    this.visibleParameters.set(newSet);
  }

  toggleDevice(deviceId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Используем this.transformedDevices() вместо this.devices
    const device = this.transformedDevices().find(d => d.id === deviceId);
    if (!device) return;

    const deviceSelected = this.isDeviceSelected(deviceId); // Вызов метода

    const currentMap = this.deviceParameterMap();
    const newMap = new Map(currentMap); // Копируем Map

    if (deviceSelected) {
      // Снимаем выделение со всех параметров устройства
      newMap.delete(deviceId);
    } else {
      // Выделяем все параметры устройства
      const allParamIds = device.parameters.map(p => p.id);
      newMap.set(deviceId, new Set(allParamIds));
    }

    this.deviceParameterMap.set(newMap); // Обновляем сигнал
    this.updateStateAndEmit();
  }

  toggleParameter(deviceId: number, paramId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Используем this.transformedDevices() вместо this.devices
    const device = this.transformedDevices().find(d => d.id === deviceId);
    if (!device) return;

    // Проверим, что параметр существует у устройства (проверяем по original id)
    const paramExists = device.parameters.some(p => p.id === paramId);
    if (!paramExists) {
      console.warn(`Попытка выбрать несуществующий параметр ${paramId} для устройства ${deviceId}`);
      return;
    }

    const currentMap = this.deviceParameterMap();
    const newMap = new Map(currentMap); // Копируем Map

    let selectedParams = newMap.get(deviceId);
    if (!selectedParams) {
      selectedParams = new Set<number>();
    }

    const newSet = new Set(selectedParams); // Копируем Set
    const paramSelected = newSet.has(paramId);

    if (paramSelected) {
      newSet.delete(paramId);
      // Если больше нет параметров для этого устройства, удалим запись
      if (newSet.size === 0) {
        newMap.delete(deviceId);
      } else {
        newMap.set(deviceId, newSet);
      }
    } else {
      newSet.add(paramId);
      newMap.set(deviceId, newSet);
    }

    this.deviceParameterMap.set(newMap); // Обновляем сигнал
    this.updateStateAndEmit();
  }

  private updateStateAndEmit() {
    // Преобразуем Map в массив DeviceParameterRequest[]
    const selectedData: DeviceParameterRequest[] = Array.from(this.deviceParameterMap().entries()).map(
      ([deviceId, paramSet]) => ({
        deviceId,
        parameterIds: Array.from(paramSet)
      })
    );

    console.log('MultiListSelect: обновление состояния', selectedData);

    // Обновляем состояние сервиса
    this.graphStateService.updateDeviceParameterSelection(selectedData);

    // Эмитим событие
    this.selectionChange.emit(selectedData);
  }

  // Эти методы теперь обращаются к сигналу deviceParameterMap
  getCheckboxState(deviceId: number): 'checked' | 'unchecked' | 'indeterminate' {
    const deviceParams = this.deviceParameterMap().get(deviceId);
    // Используем this.transformedDevices()
    const device = this.transformedDevices().find(d => d.id === deviceId);

    if (!device || !deviceParams) {
      return 'unchecked';
    }

    const deviceParamCount = device.parameters.length;
    const selectedParamCount = deviceParams.size;

    if (selectedParamCount === 0) {
      return 'unchecked';
    } else if (selectedParamCount === deviceParamCount) {
      return 'checked';
    } else {
      return 'indeterminate';
    }
  }

  getParameterCheckboxState(deviceId: number, paramId: number): boolean {
    const selectedParams = this.deviceParameterMap().get(deviceId);
    return selectedParams ? selectedParams.has(paramId) : false;
  }

  isDeviceSelected(deviceId: number): boolean {
    const params = this.deviceParameterMap().get(deviceId);
    return params ? params.size > 0 : false;
  }

  isDeviceParametersVisible(deviceId: number): boolean {
    return this.visibleParameters().has(deviceId);
  }
}

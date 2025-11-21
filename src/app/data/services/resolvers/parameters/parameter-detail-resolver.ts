import {ResolveFn} from '@angular/router';
import {ParameterDetail} from '../../interfaces/parameter/parameter-detail';
import {DeviceTypeDetail} from '../../interfaces/device-type/device-type-detail';
import {DeviceByDeviceType} from '../../interfaces/device/device-by-device-type';
import {EnumOption} from '../../interfaces/enum/enum-option';
import {inject} from '@angular/core';
import {catchError, forkJoin, of} from 'rxjs';
import {DeviceTypeService} from '../../device-type-service';
import {ParameterService} from '../../parameter-service';
import {EnumService} from '../../enum-service';
import {StatusDictionaryCard} from '../../interfaces/status-dictionary/status-dictionary-card';
import {StatusDictionaryService} from '../../status-dictionary-service';

export interface parameterDetailPageData {
  parameter: ParameterDetail | null;
  deviceType: DeviceTypeDetail | null;
  devices: DeviceByDeviceType[];
  dataTypes: EnumOption[];
  statusDictionaries: StatusDictionaryCard[];
}

export const parameterDetailResolver: ResolveFn<parameterDetailPageData> = (route, state) => {
  const deviceTypeService = inject(DeviceTypeService);
  const parameterService = inject(ParameterService);
  const enumService = inject(EnumService);
  const deviceTypeId = Number(route.paramMap.get('deviceTypeId'));
  const parameterId = route.paramMap.get('parameterId');
  const statusDictionaryService = inject(StatusDictionaryService);

  if (isNaN(deviceTypeId)) {
    console.error('Invalid deviceTypeId:', route.paramMap.get('deviceTypeId'));
    return of({
      parameter: null,
      deviceType: null,
      devices: [],
      dataTypes: [],
      statusDictionaries: []
    });
  }

  const parameter$ = parameterId === 'new' || parameterId === null
    ? of(null)
    : parameterService.getParameterById(deviceTypeId, Number(parameterId)).pipe(
      catchError(error => {
        console.error('Failed to load parameter in resolver', error);
        return of(null);
      })
    );

  return forkJoin({
    parameter: parameter$,
    deviceType: deviceTypeService.getDeviceTypeById(deviceTypeId).pipe(
      catchError(error => {
        console.error('Failed to load device type in resolver', error);
        return of(null);
      })
    ),
    devices: deviceTypeService.getDevicesByType(deviceTypeId).pipe(
      catchError(error => {
        console.error('Failed to load devices in resolver', error);
        return of([]);
      })
    ),
    dataTypes: enumService.getDataTypes().pipe(
      catchError(error => {
        console.error('Failed to load data types in resolver', error);
        return of([
          {name: 'INTEGER', displayName: 'Целочисленный'},
          {name: 'DOUBLE', displayName: 'Дробный'},
          {name: 'LONG', displayName: 'Большое целое число'},
          {name: 'STRING', displayName: 'Строковый'},
          {name: 'ENUMERATED', displayName: 'Перечисляемый'}
        ]);
      })
    ),
    statusDictionaries: statusDictionaryService.getStatusDictionaries().pipe(
      catchError(error => {
        console.error('Failed to load status dictionaries in resolver', error);
        return of([]);
      })
    )
  });
};

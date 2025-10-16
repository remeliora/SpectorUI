import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DeviceTypeCard} from './interfaces/device-type/device-type-card';
import {DeviceTypeDetail} from './interfaces/device-type/device-type-detail';
import {BehaviorSubject, Observable} from 'rxjs';
import {DeviceTypeCreate} from './interfaces/device-type/device-type-create';
import {DeviceByDeviceType} from './interfaces/device/device-by-device-type';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/device-types'

  private refreshFiltersSubject = new BehaviorSubject<void>(undefined);
  refreshFilters$ = this.refreshFiltersSubject.asObservable();

  getUniqueClassNames() {
    return this.http.get<string[]>(`${this.baseApiUrl}/unique-class-names`)

  }

  getDeviceTypes(className?: string | null) {
    let params = new HttpParams();
    if (className) {
      params = params.set('className', className);
    }
    return this.http.get<DeviceTypeCard[]>(this.baseApiUrl, {params})
  }

  getDeviceTypeById(id: number) {
    return this.http.get<DeviceTypeDetail>(`${this.baseApiUrl}/${id}`);
  }

  getDevicesByType(deviceTypeId: number) {
    return this.http.get<DeviceByDeviceType[]>(
      `${this.baseApiUrl}/${deviceTypeId}/devices-list`
    );
  }

  createDeviceType(data: DeviceTypeCreate) {
    return this.http.post<DeviceTypeDetail>(this.baseApiUrl, data);
  }

  updateDeviceType(id: number, data: DeviceTypeDetail) {
    return this.http.put<DeviceTypeDetail>(`${this.baseApiUrl}/${id}`, data);
  }

  deleteDeviceType(id: number) {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  refreshFilters(): void {
    this.refreshFiltersSubject.next();
  }
}

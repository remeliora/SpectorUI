import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {DeviceCard} from './interfaces/device/device-card';
import {DeviceDetail} from './interfaces/device/device-detail';
import {DeviceTypeShort} from './interfaces/device-type/device-type-short';
import {DeviceCreate} from './interfaces/device/device-create';
import {DeviceUpdate} from './interfaces/device/device-update';
import {DeviceDetailCard} from './interfaces/device/device-detail-card';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/devices'

  private refreshFiltersSubject = new BehaviorSubject<void>(undefined);
  refreshFilters$ = this.refreshFiltersSubject.asObservable();

  getUniqueLocations() {
    return this.http.get<string[]>(`${this.baseApiUrl}/unique-locations`)
  }

  getDevices(location?: string | null) {
    let params = new HttpParams();
    if (location) {
      params = params.set('location', location);
    }
    return this.http.get<DeviceCard[]>(`${this.baseApiUrl}/monitoring`, {params})
  }

  getDeviceDataDetail(deviceId: number) {
    return this.http.get<DeviceDetailCard>(`${this.baseApiUrl}/monitoring/${deviceId}`);
  }

  getDeviceDetail(deviceId: number) {
    return this.http.get<DeviceDetail>(`${this.baseApiUrl}/${deviceId}`);
  }

  getAvailableDeviceTypes() {
    return this.http.get<DeviceTypeShort[]>(`${this.baseApiUrl}/available-device-types`);
  }

  enableDevice(deviceId: number) {
    return this.http.put(`${this.baseApiUrl}/${deviceId}/enable`, {});
  }

  disableDevice(deviceId: number) {
    return this.http.put(`${this.baseApiUrl}/${deviceId}/disable`, {});
  }

  createDevice(data: DeviceCreate) {
    return this.http.post<DeviceDetail>(this.baseApiUrl, data);
  }

  updateDevice(deviceId: number, data: DeviceUpdate) {
    return this.http.put<DeviceDetail>(`${this.baseApiUrl}/${deviceId}`, data);
  }

  deleteDevice(deviceId: number) {
    return this.http.delete<void>(`${this.baseApiUrl}/${deviceId}`);
  }

  refreshFilters(): void {
    this.refreshFiltersSubject.next();
  }
}

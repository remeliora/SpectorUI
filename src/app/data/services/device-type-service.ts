import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DeviceTypeCard} from './interfaces/device-type-card';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/device-types'

  getUniqueClassNames() {
    return this.http.get<string[]>(`${this.baseApiUrl}/unique-class-names`)

  }

  getDeviceTypes(className?: string | null) {
    let params = new HttpParams();
    if (className) {
      params = params.set('className', className);
    }
    return this.http.get<DeviceTypeCard[]>(this.baseApiUrl, { params })
  }
}

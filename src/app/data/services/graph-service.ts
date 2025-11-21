import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DeviceWithActiveParameters} from './interfaces/graph/device-with-active-parameters';
import {ChartDataRequest} from './interfaces/graph/chart-data-request';
import {ChartDataResponse} from './interfaces/graph/chart-data-response';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/graphs'

  getDevicesWithActiveParameters(): Observable<DeviceWithActiveParameters[]> {
    return this.http.get<DeviceWithActiveParameters[]>(`${this.baseApiUrl}/devices-with-active-parameters`);
  }

  getChartData(request: ChartDataRequest): Observable<ChartDataResponse> {
    return this.http.post<ChartDataResponse>(`${this.baseApiUrl}/data`, request);
  }
}

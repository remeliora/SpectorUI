import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ThresholdCard} from './interfaces/threshold/threshold-card';
import {ThresholdDetail} from './interfaces/threshold/threshold-detail';
import {Observable} from 'rxjs';
import {ThresholdCreate} from './interfaces/threshold/threshold-create';
import {ThresholdUpdate} from './interfaces/threshold/threshold-update';
import {ParameterShort} from './interfaces/parameter/parameter-short';

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  private readonly http = inject(HttpClient);

  getThresholds(deviceId: number) {
    return this.http.get<ThresholdCard[]>(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds`
    );
  }

  getThresholdById(deviceId: number, thresholdId: number) {
    return this.http.get<ThresholdDetail>(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds/${thresholdId}`
    );
  }

  getAvailableParameters(deviceId: number): Observable<ParameterShort[]> {
    return this.http.get<ParameterShort[]>(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds/available-parameters`
    );
  }

  createThreshold(deviceId: number, threshold: ThresholdCreate) {
    return this.http.post<ThresholdDetail>(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds`,
      threshold
    );
  }

  updateThreshold(deviceId: number, thresholdId: number, threshold: ThresholdUpdate) {
    return this.http.put<ThresholdDetail>(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds/${thresholdId}`,
      threshold
    );
  }

  deleteThreshold(deviceId: number, thresholdId: number) {
    return this.http.delete(
      `http://localhost:8080/api/v1/main/devices/${deviceId}/thresholds/${thresholdId}`
    );
  }
}

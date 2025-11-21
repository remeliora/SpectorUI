import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {DeviceDataStatus} from './interfaces/device/device-data-status';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs'
import {ParameterDataStatus} from './interfaces/parameter/parameter-data-status';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private connected = false;
  private connecting = false; // Флаг, чтобы избежать дублирующихся попыток подключения
  private connectionPromise: Promise<void> | null = null; // Для ожидания установки соединения

  // Счётчики активных подписок
  private deviceStatusSubscribers = 0; // Для /topic/devices
  private deviceParameterSubscribers = new Map<number, number>(); // Для /topic/device/{id}

  // Субъект для рассылки обновлений статуса устройств
  private deviceStatusSubject = new Subject<DeviceDataStatus>();
  private deviceStatus$ = this.deviceStatusSubject.asObservable();

  // Хранилище субъектов и подписок для параметров устройств
  private deviceParameterSubjects = new Map<number, Subject<ParameterDataStatus>>();

  constructor() {
  }

  // --- Методы для управления подпиской на статусы устройств ---
  requestDeviceStatusUpdates(): Observable<DeviceDataStatus> {
    this.deviceStatusSubscribers++;
    this.ensureConnection(); // Подключаемся, если ещё не подключены
    this.subscribeToDeviceStatusIfNecessary(); // Подписываемся, если ещё не подписаны
    return this.deviceStatus$;
  }

  releaseDeviceStatusUpdates(): void {
    if (this.deviceStatusSubscribers > 0) {
      this.deviceStatusSubscribers--;
      // Если больше никто не слушает статусы, отписываемся
      if (this.deviceStatusSubscribers === 0) {
        this.unsubscribeFromDeviceStatus();
      }
      this.checkAndDisconnect(); // Проверяем, нужно ли отключаться
    }
  }

  private subscribeToDeviceStatusIfNecessary(): void {
    if (!this.stompClient || !this.connected) {
      console.warn('WebSocketService: Cannot subscribe to /topic/devices, not connected.');
      return;
    }
    // Проверяем, есть ли уже подписка
    if (!this.stompClient['deviceStatusSubscription']) {
      console.log('WebSocketService: Subscribing to /topic/devices');
      const subscription = this.stompClient.subscribe('/topic/devices', (message: any) => {
        try {
          const deviceStatus: DeviceDataStatus = JSON.parse(message.body);
          console.log('WebSocketService: Received device status update:', deviceStatus);
          this.deviceStatusSubject.next(deviceStatus);
        } catch (e) {
          console.error('WebSocketService: Error parsing device status message:', e);
        }
      });
      this.stompClient['deviceStatusSubscription'] = subscription;
    }
  }

  private unsubscribeFromDeviceStatus(): void {
    if (this.stompClient && this.stompClient['deviceStatusSubscription']) {
      console.log('WebSocketService: Unsubscribing from /topic/devices');
      this.stompClient['deviceStatusSubscription'].unsubscribe();
      delete this.stompClient['deviceStatusSubscription'];
    }
  }

  // --- Методы для управления подпиской на параметры устройства ---
  requestDeviceParameterUpdates(deviceId: number): Observable<ParameterDataStatus> {
    // Увеличиваем счётчик подписчиков для этого deviceId
    const currentCount = this.deviceParameterSubscribers.get(deviceId) || 0;
    this.deviceParameterSubscribers.set(deviceId, currentCount + 1);

    // Создаём Subject, если его ещё нет
    if (!this.deviceParameterSubjects.has(deviceId)) {
      this.deviceParameterSubjects.set(deviceId, new Subject<ParameterDataStatus>());
    }

    this.ensureConnection(); // Подключаемся, если ещё не подключены
    this.subscribeToDeviceParametersIfNecessary(deviceId); // Подписываемся на конкретное устройство

    return this.deviceParameterSubjects.get(deviceId)!.asObservable();
  }

  releaseDeviceParameterUpdates(deviceId: number): void {
    const currentCount = this.deviceParameterSubscribers.get(deviceId) || 0;
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      this.deviceParameterSubscribers.set(deviceId, newCount);

      if (newCount === 0) {
        // Если больше никто не слушает этот deviceId, отписываемся и удаляем Subject
        this.unsubscribeFromDeviceParameters(deviceId);
        const subject = this.deviceParameterSubjects.get(deviceId);
        if (subject) {
          subject.complete();
          this.deviceParameterSubjects.delete(deviceId);
        }
        this.deviceParameterSubscribers.delete(deviceId); // Удаляем счётчик
      }
      this.checkAndDisconnect(); // Проверяем, нужно ли отключаться
    }
  }

  private subscribeToDeviceParametersIfNecessary(deviceId: number): void {
    if (!this.stompClient || !this.connected) {
      console.warn(`WebSocketService: Cannot subscribe to /topic/device/${deviceId}, not connected.`);
      return;
    }

    const topic = `/topic/device/${deviceId}`;
    // Проверяем, есть ли уже подписка для этого топика
    if (!this.stompClient[`deviceParameterSubscription_${deviceId}`]) {
      console.log(`WebSocketService: Subscribing to ${topic}`);
      const subscription = this.stompClient.subscribe(topic, (message: any) => {
        try {
          const paramStatus: ParameterDataStatus = JSON.parse(message.body);
          console.log(`WebSocketService: Received parameter update for device ${paramStatus.deviceId}:`, paramStatus);
          const targetSubject = this.deviceParameterSubjects.get(paramStatus.deviceId);
          if (targetSubject) {
            targetSubject.next(paramStatus);
          }
        } catch (e) {
          console.error(`WebSocketService: Error parsing parameter message for device ${deviceId}:`, e);
        }
      });
      // Сохраняем подписку с уникальным ключом
      this.stompClient[`deviceParameterSubscription_${deviceId}`] = subscription;
    }
  }

  private unsubscribeFromDeviceParameters(deviceId: number): void {
    const topic = `/topic/device/${deviceId}`;
    if (this.stompClient && this.stompClient[`deviceParameterSubscription_${deviceId}`]) {
      console.log(`WebSocketService: Unsubscribing from ${topic}`);
      this.stompClient[`deviceParameterSubscription_${deviceId}`].unsubscribe();
      delete this.stompClient[`deviceParameterSubscription_${deviceId}`];
    }
  }

  // --- Внутренние методы управления подключением ---
  private ensureConnection(): Promise<void> {
    if (this.connected || this.connecting) {
      return this.connectionPromise || Promise.resolve();
    }

    this.connecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('WebSocketService: Attempting to connect...');
      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = Stomp.over(socket);

      this.stompClient.connect({}, (frame: any) => {
        console.log('WebSocketService: Connected: ' + frame);
        this.connected = true;
        this.connecting = false;
        // После подключения восстанавливаем активные подписки
        if (this.deviceStatusSubscribers > 0) {
          this.subscribeToDeviceStatusIfNecessary();
        }
        this.deviceParameterSubscribers.forEach((_, id) => {
          this.subscribeToDeviceParametersIfNecessary(id);
        });
        resolve();
      });

      this.stompClient.onWebSocketClose = () => {
        console.log('WebSocketService: WebSocket connection closed.');
        this.connected = false;
        this.connecting = false;
        // Очищаем все подписки при закрытии
        this.stompClient['deviceStatusSubscription'] = undefined;
        this.deviceParameterSubscribers.forEach((_, id) => {
          this.stompClient[`deviceParameterSubscription_${id}`] = undefined;
        });
        // Повторное подключение можно реализовать здесь, если нужно
      };

      this.stompClient.onStompError = (frame: any) => {
        console.error('WebSocketService: Broker reported error: ' + frame.headers['message']);
        console.error('WebSocketService: Additional details: ' + frame.body);
        this.connected = false;
        this.connecting = false;
        reject(new Error(`STOMP error: ${frame.headers['message']}`));
      };
    });

    return this.connectionPromise;
  }

  private checkAndDisconnect(): void {
    // Отключаемся, только если нет активных подписчиков ни на статусы, ни на параметры
    if (this.connected && this.deviceStatusSubscribers === 0 && this.deviceParameterSubscribers.size === 0) {
      this.disconnect();
    }
  }

  private disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      console.log('WebSocketService: Disconnected.');
      this.connected = false;
      this.connecting = false;
      // Очищаем счётчики и субъекты при отключении
      this.deviceStatusSubscribers = 0;
      this.deviceParameterSubscribers.clear();
      this.deviceParameterSubjects.forEach(subject => subject.complete());
      this.deviceParameterSubjects.clear();
      this.connectionPromise = null;
    }
  }
}

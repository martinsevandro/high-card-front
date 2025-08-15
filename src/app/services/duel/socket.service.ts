import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;

  connect(url: string, auth: { token: string }): void {
    this.socket = io(url, { auth });
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  get id(): string | undefined {
    return this.socket?.id;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  get connected(): boolean {
    return !!this.socket?.connected;
  }
}

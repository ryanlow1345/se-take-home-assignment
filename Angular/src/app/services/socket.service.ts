import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000/');
  }

  // Listen for order updates
  getOrdersUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orders_update', (data: any) => {
        observer.next(data);
      });

      return () => this.socket.disconnect(); // Cleanup on destroy
    });
  }
}

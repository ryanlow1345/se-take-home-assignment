import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  http = inject(HttpClient);

  url = signal("http://localhost:3000/");

  addBot() {
    return this.http.post(`${this.url()}bot/add`, {});
  }

  deleteBot(id: number) {
    return this.http.delete(`${this.url()}bot/delete/${id}`);
  }

  getBot() {
    return this.http.get(`${this.url()}bot/get`);
  }

  addOrder(type: any) {
    return this.http.post(`${this.url()}order/add`, type);
  }

  getOrder() {
    return this.http.get(`${this.url()}order/get`);
  }
}

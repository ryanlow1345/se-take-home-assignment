import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-order',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PopoverModule,
    RadioButtonModule,
    InputTextModule,
    TagModule
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {

  api = inject(ApiService);
  socket = inject(SocketService);
  fb = inject(FormBuilder);
  pending_orders = signal<any[]>([]);
  processing_orders = signal<any[]>([]);
  completed_orders = signal<any[]>([]);
  orders = signal<any[]>([]);

  order_form = this.fb.group({
    type: this.fb.control("Normal", Validators.required),
    name: this.fb.control("", Validators.required)
  });

  ngOnInit(): void {
    this.socket.getOrdersUpdate().subscribe((data: any) => {
      this.pending_orders.set(data.pending_orders);
      this.completed_orders.set(data.completed_orders);
      this.processing_orders.set(data.processing_orders);
    });
    this.getOrder();
  }

  getOrder() {
    this.api.getOrder().subscribe((response: any) => {
      this.pending_orders.set(response.pending_orders);
      this.processing_orders.set(response.processing_orders);
      this.completed_orders.set(response.completed_orders);
      this.orders.set([...response.pending_orders, ...response.completed_orders]);
    });
  }

  submitOrder() {
    this.api.addOrder(this.order_form.getRawValue()).subscribe((response: any) => {
      this.getOrder();
    });
  }

  getStatus(id: string) {
    let status = "";
    if (this.pending_orders().find((element: any) => (element.id === id))) {
      status = "PENDING"
    }
    if (this.completed_orders().find((element: any) => (element.id === id))) {
      status = "COMPLETED"
    }
    return status;
  }

  getSeverity(id: string) {
    let severity = "";
    if (this.pending_orders().find((element: any) => (element.id === id))) {
      severity = "warn"
    }
    if (this.completed_orders().find((element: any) => (element.id === id))) {
      severity = "success"
    }
    return severity;
  }
}

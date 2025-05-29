import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-bot',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PopoverModule,
    RadioButtonModule,
    InputTextModule,
    TagModule
  ],
  templateUrl: './bot.component.html',
  styleUrl: './bot.component.css'
})
export class BotComponent {

  api = inject(ApiService);
  fb = inject(FormBuilder);
  bots = signal<any[]>([]);

  ngOnInit(): void {
    this.getBot();
  }

  getBot() {
    this.api.getBot().subscribe((response: any) => {
      this.bots.set(response.bots)
      console.log(response);
    });
  }

  addBot() {
    this.api.addBot().subscribe((response: any) => {
      this.getBot();
    });
  }
  
  deleteBot(id: number) {
    this.api.deleteBot(id).subscribe((response: any) => {
      this.getBot();
    });
  }
}


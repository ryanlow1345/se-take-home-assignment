import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [
    MenubarModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  items = signal([
    {
      label: 'Order',
      icon: 'pi pi-list',
      url: 'order'
    },
    {
      label: 'Bots',
      icon: 'pi pi-android',
      url: 'bot'
    }
  ])

}

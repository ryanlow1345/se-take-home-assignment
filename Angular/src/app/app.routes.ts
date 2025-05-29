import { Routes } from '@angular/router';
import { OrderComponent } from './page/order/order.component';
import { BotComponent } from './page/bot/bot.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'order'},
    { path: 'order', pathMatch: 'full', component: OrderComponent},
    { path: 'bot', pathMatch: 'full', component: BotComponent}
];

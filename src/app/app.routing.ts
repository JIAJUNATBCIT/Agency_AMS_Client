import { ModuleWithProviders }   from '@angular/core';
import { Routes, RouterModule }  from '@angular/router';
import { PageAComponent }        from './app.page-a';
import { PageBComponent }        from './app.page-b';
import { PageCComponent }        from './app.page-c'
import { PageDComponent }        from './app.page-d'
import { PageEComponent }        from './app.page-e'
import { PageFComponent }        from './app.page-f'
import { TicketCentreComponent } from './app.page-ticketCentre'
import { PageDefault }           from './app.pagedefault';

const appRoutes: Routes = [
  { path: 'User/Login', component: PageAComponent },
  { path: 'User/Register', component: PageBComponent },
  { path: 'User/Profile', component: PageCComponent },
  { path: 'Admin/Employees', component: PageDComponent },
  { path: 'Events/Booking', component: PageEComponent },
  { path: 'Ticket/MyTickets', component: PageFComponent },
  { path: 'Admin/TicketCentre', component: TicketCentreComponent},
  { path: '', redirectTo: 'User/Login', pathMatch: 'full' },
  { path: '**', component: PageDefault }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

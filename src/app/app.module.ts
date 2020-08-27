import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { PageDefault }    from './app.pagedefault';
import { PageAComponent } from './app.page-a';
import { PageBComponent } from './app.page-b';
import { PageCComponent } from './app.page-c';
import { PageDComponent } from './app.page-d';
import { PageEComponent } from './app.page-e';
import { PageFComponent } from './app.page-f';
import { TicketCentreComponent } from './app.page-ticketCentre';
import { routing }        from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    AppComponent, 
    PageDefault, 
    PageAComponent, 
    PageBComponent, 
    PageCComponent, 
    PageDComponent, 
    PageEComponent,
    PageFComponent,
    TicketCentreComponent],
  imports: [
    BrowserModule, 
    FormsModule, 
    HttpClientModule, 
    routing, 
    ReactiveFormsModule, 
    BrowserAnimationsModule, 
    NgbModule, 
    TableModule,
    PasswordModule,
    InputTextModule,
    PanelModule,
    DropdownModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule,
    CalendarModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

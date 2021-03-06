import { Component, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './ApiService';
import { Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ticket } from './Models/Ticket';
import { SortEvent, MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.page-f.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class PageFComponent {
    //------ Global ----- //
    title = 'Create Ticket';
    token = '';
    _apiService:ApiService;
    _http:HttpClient;
    _router: Router;

    // ---- User Model ---- //
    _username:string = '';
    _first_name:string = '';
    _last_name:string = '';
    _office:string='';

    // ---- Ticket Model ---- //
    _email:string = '';
    _phone:string = '';
    _date = new Date().toLocaleDateString();
    _description: string = '';
    _tickets: Ticket[] = [];
    _selected_ticket: Ticket = null;
    _roles:string[] = [];
    _errorMessage:string = '';
    display_role:string = '';
    public site='http://localhost:1337/';
    fileupload_url = this.site + "Ticket/UploadFiles";
    filedownload_url = this.site + "Ticket/Download";
    downloadJson = [];

    // ---- Pagination & Filter ---- //
    cols = [
        { field: 'ticket_id', header: 'Ticket ID' },
        { field: 'date', header: 'Date' },
        { field: 'description', header: 'Description' },
        { field: 'assigned_name', header: 'Assigned To' },
        { field: 'status', header: 'Status' },
        { field: 'admin_note', header: 'Admin Note' }
    ];
    first = 0;
    rows = 10;

    // Since we are using a provider above we can receive 
    // an instance through a constructor.
    constructor(private http: HttpClient, private router: Router, private modalService: NgbModal, private messageService: MessageService) {
        // Pass in http module and pointer to AppComponent.
        this._apiService = new ApiService(http, this);
        this._http = http;
        this._router = router;
        this.messageService = messageService;
        this.getStaffData();
    }

    openCreateTicketModal(content) {
        this.modalService.open(content, {backdropClass: 'light-grey-backdrop'});
    }

    openTicketInfoModal(content) {
        if(this._selected_ticket) {
            this.modalService.open(content, {backdropClass: 'light-grey-backdrop'});
        }
    }

    //------------------------------------------------------------
    // Either shows content when logged in or clears contents.
    //------------------------------------------------------------
    getStaffData() {
        // Logged in if token exists in browser cache.
        if(sessionStorage.getItem('auth_token')!=null) {
            this.token = sessionStorage.getItem('auth_token');
            this._apiService.getData('User/Profile', this.staffDataCallback);
        }
    }

    staffDataCallback(result, _this) {
        if(result.errorMessage == "") {
            _this._roles = result.user.roles;
            _this._username = result.user.username;
            _this._first_name = result.user.firstname;
            _this._last_name = result.user.lastname;
            _this._street_address = result.user.streetaddress;
            _this._email = result.user.email;
            _this._phone = result.user.phonenumber;
            _this.getDispalyRole();
            _this.getAllTicketsByUser();
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }   
        
    }

    get isManager() {
        if(this._roles != null) {
            for (var i=0; i< this._roles.length; i++){
               if(this._roles[i] === 'Manager' || this._roles[i] === 'HR') {
                    return true
               } 
            }
        }
        return false;
    }

    get isHR() {
        if(this._roles != null) {
            for (var i=0; i< this._roles.length; i++) {
               if(this._roles[i] === 'HR') {
                    return true
               } 
            }
        }
        return false;
    }

    get isAdmin() {
        if(this._roles != null) {
            if(this._roles.includes('Admin')) {
                return true
            }
        }
        return false
    }

    logout() {
        sessionStorage.clear();   
        // Clear data. 
        this._username = '';
        this._first_name = '';
        this._last_name =  '';
        this._office = '';
        this._email = '';
        this._phone = '';
        this._roles = [];
    }

    getAllTicketsByUser() {
        this._apiService.postData('Ticket/ListTicketsByUsername', {username: this._username}, this.getAllTicketsByUserCallback)
    }

    getAllTicketsByUserCallback(result, _this) {
        if(result.errorMessage == '') {
            _this._tickets = result.tickets;
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }

    generateTicketId() {
        let ticket_id = 'ITS-' + String(new Date().getTime()) + '-' + String(Math.floor(Math.random()*1000));
        console.log('Ticket ID: ' + ticket_id)
        return ticket_id;
    }

    createTicket() {   
        let ticket_id = this.generateTicketId();
        this._tickets.forEach(ticket => {
            if(ticket_id == ticket.ticket_id)  {
                ticket_id = this.generateTicketId();
            }
        });
        let newTicket:Ticket = {
            ticket_id: ticket_id,
            username: this._username,
            phonenumber: this._phone,
            email: this._email,
            date: this._date,
            description: this._description,
            assigned_name:'',
            assigned_email:'',
            assigned_phone:'',
            status:'Pending',
            admin_note:'',
            downloadJson: this.downloadJson
        }
        this._apiService.postData('Ticket/CreateTicket', newTicket, this.createTicketCallback);
    }

    createTicketCallback(result, _this) {
        if(result.errorMessage == '') {
            _this.getAllTicketsByUser();
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }

    textAreaAdjust(textarea) {
        textarea.style.overflow = "hidden";
        textarea.style.height = "12px";
        textarea.style.resize = "none";
        textarea.style.height = (25 + textarea.scrollHeight) + "px";
    }

    getDispalyRole() {
        if(this.isAdmin) {
            this.display_role = 'Admin';
        } else if(this.isHR) {
            this.display_role = 'HR';
        } else if (this.isManager) {
            this.display_role = 'Managers';
        } else if (this.token != '') {
            this.display_role = 'Staff';
        } else {
            this.display_role = 'ALL';
        }
    }

    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;

            if (value1 == null && value2 != null)
                result = -1;
            else if (value1 != null && value2 == null)
                result = 1;
            else if (value1 == null && value2 == null)
                result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string')
                result = value1.localeCompare(value2);
            else
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            return (event.order * result);
        });
    }

    updateTicket() {
        let dataObject = {
            ticket_id: this._selected_ticket.ticket_id,
            username: this._selected_ticket.username,
            phonenumber: this._selected_ticket.phonenumber,
            email: this._selected_ticket.email,
            date: this._selected_ticket.date,
            description: this._selected_ticket.description,
            assigned_name: this._selected_ticket.assigned_name,
            assigned_email: this._selected_ticket.assigned_email,
            assigned_phone: this._selected_ticket.assigned_phone,
            status: this._selected_ticket.status,
            admin_note: this._selected_ticket.admin_note,
            downloadJson: this._selected_ticket.downloadJson
        }
        this._apiService.postData('Ticket/UpdateTicket', dataObject, this.updateTicketCallback);                              
    }

    updateTicketCallback(result, _this) {
        for(let ticket of _this._tickets) {
            if (ticket.ticket_id == result.ticket.ticket_id) {
                ticket.username = result.ticket.username;
                ticket.phonenumber = result.ticket.phonenumber;
                ticket.email = result.ticket.email;
                ticket.date = result.ticket.date;
                ticket.description = result.ticket.description;
                ticket.assigned_name = result.ticket.assigned_name;
                ticket.assigned_email = result.ticket.assigned_email;
                ticket.assigned_phone = result.ticket.assigned_phone;
                ticket.status = result.ticket.status;
                ticket.admin_note = result.ticket.admin_note;
                ticket.downloadJson = result.ticket.downloadJson;
            }
        }
        _this.messageService.add({key: 'updateTk_success', severity: 'success', summary: 'Success', detail: 'Ticket has been updated'});
        _this.getAllTicketsByUser();
    }

    onUpload(event) {
        var myfiles = [];
        if(event.files.length > 0) {
            for(let file of event.files) {
                myfiles.push({filename: file.name, filesize: file.size});
            }
        }
        this._apiService.postData('Ticket/GetDownLoadLink', {myfiles: myfiles}, this.onUploadCallback);
    }

    onUploadCallback(result, _this) {
        _this.messageService.add({key: 'uploaded', severity: 'success', summary: 'Success', detail: 'file(s) uploaded'});
        _this.downloadJson = _this.downloadJson.concat(result.myfiles);
        if(_this._selected_ticket) {
            _this._selected_ticket.downloadJson =_this._selected_ticket.downloadJson.concat(_this.downloadJson);
        }
    }

    delConfirm() {
        this.messageService.clear();
        this.messageService.add({key: 'del_tks', sticky: true, severity:'warn', summary:'Delete Ticket?', detail:'Confirm to proceed'});
    }

    delTicket() {
        this.messageService.clear('del_tks');
        let dataObject = {
            ticket_id: this._selected_ticket.ticket_id
        }
        this._apiService.postData('Ticket/DeleteTicket', dataObject, this.delTicketCallback);
    }

    delTicketCallback(result, _this) {
        if(result.errorMessage == '') {
            _this.getAllTicketsByUser();
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }

    onReject() {
        this.messageService.clear('del_tks');
    }

    download(filename) {
        location.href = this.filedownload_url + '/' + filename;
    }

    next() {
        this.first = this.first + this.rows;
    }

    prev() {
        this.first = this.first - this.rows;
    }

    reset() {
        this.first = 0;
    }

    isLastPage(): boolean {
        return this.first === (this._tickets.length - this.rows);
    }

    isFirstPage(): boolean {
        return this.first === 0;
    }
}

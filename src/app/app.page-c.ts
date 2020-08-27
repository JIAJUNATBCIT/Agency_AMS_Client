import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './ApiService';
import { Router } from '@angular/router';
import { SelectItem, MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.page-c.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class PageCComponent {
    token = '';
    _apiService:ApiService;
    _username:string = '';
    _first_name:string = '';
    _last_name:string =  '';
    _office:string = '';
    _offices: SelectItem[];
    _email:string = '';
    _phone:string = '';
    _roles:string[] = [];
    _errorMessage:string = '';
    display_role:string = '';
    public site='http://localhost:1337/';

    // Since we are using a provider above we can receive 
    // an instance through an constructor.
    constructor(private http: HttpClient, private router: Router, private messageService: MessageService) {
        // Pass in http module and pointer to AppComponent.
        this._apiService = new ApiService(http, this);
        this._offices = [
            {label: 'BROADWAY', value: 'BROADWAY'},
            {label: 'KINGSWAY', value: 'KINGSWAY'},
            {label: 'NANAIMO', value: 'NANAIMO'},
            {label: 'NORTH SHORE', value: 'NORTH SHORE'},
            {label: 'RIDGE MEADOWS', value: 'RIDGE MEADOWS'},
            {label: 'TRICITIES', value: 'TRICITIES'},
            {label: 'VICTORIA', value: 'VICTORIA'}
        ];
        this.messageService = messageService;
        this.getStaffData();
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
            _this._office = result.user.office;
            _this._email = result.user.email;
            _this._phone = result.user.phonenumber;
            _this.getDispalyRole();
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
            for (var i=0; i< this._roles.length; i++){
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

    update() {
        let dataObject = {
            username : this._username,
            firstname: this._first_name,
            lastname: this._last_name,
            office: this._office,
            email: this._email,
            phonenumber: this._phone,
            roles: this._roles
        }
        this._apiService.postData('User/Update', dataObject, this.updateCallback);                              
    }

    updateCallback(result, _this) {
        _this.messageService.add({key: 'updateUser_success', severity: 'success', summary: 'Success', detail: 'Profile has been updated'});
        _this.getStaffData();
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
}

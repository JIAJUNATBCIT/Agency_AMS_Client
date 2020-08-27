import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './ApiService';
import { Router } from '@angular/router';
import { SortEvent, SelectItem, MessageService } from 'primeng/api';
import { User } from './Models/user';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.page-d.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})

export class PageDComponent {
    token                 = '';
    _apiService:ApiService;
    _username:string = '';
    _first_name:string = '';
    _last_name:string =  '';
    _office:string = '';
    _offices: SelectItem[];
    _email:string = '';
    _phone:string = '';
    _roles:string[] = [];
    _all_users:User[] = [];  
    display_role:string = '';
    _selectedUser: User = null;
    public site='http://localhost:1337/';

    // ---- Pagination & Filter ---- //
    cols = [
        { field: 'username', header: 'UserName' },
        { field: 'firstname', header: 'FirstName' },
        { field: 'lastname', header: 'LastName' },
        { field: 'office', header: 'Office' },
        { field: 'email', header: 'Email' },
        { field: 'phonenumber', header: 'Phone' }
    ];
    first = 0;
    rows = 10;

    // Since we are using a provider above we can receive 
    // an instance through an constructor.
    constructor(private http: HttpClient, private router: Router, private modalService: NgbModal, private messageService: MessageService) {
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
        this.messageService = messageService
        this.getManagerData();
        this.getAllUser();
    }
    //------------------------------------------------------------
    // Either shows content when logged in or clears contents.
    //------------------------------------------------------------
    getManagerData() {
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
            alert(JSON.stringify(result.errorMessage));
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

    get canDel() {
        if(this._roles != null) {
            for (var i=0; i< this._roles.length; i++){
               if(this._roles[i] === 'HR' || this._roles[i] === 'Admin') { // Permission: only HR and Admin can del user
                    if(this._selectedUser.username != this._username) { // can't del yourself
                        return true
                    } 
                } 
            }
        }
        return false;
    }

    get isCurUser() {
        if(this._roles != null) {
            if(this._selectedUser.username != this._username) {
                return true
            }
        }
        return false
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

    getAllUser() {
        this._apiService.getData('User/AllUsers', this.getAllUserCallback);    
    }

    getAllUserCallback(result, _this) {
        _this._all_users = result.all_users;
    }

    getUserByUsername() {
        if(this._selectedUser) {
            this._apiService.postData('User/GetUserByUsername', this._selectedUser.username, this.getUserByUsernameCallback)
        }
    }

    getUserByUsernameCallback(result, _this) {
        if(result.errorMessage == "") {
            _this._selectedUser.firstname = result.user.firstname;
            _this._selectedUser.lastname = result.user.lastname;
            _this._selectedUser.office = result.user.office;
            _this._selectedUser.email = result.user.email;
            _this._selectedUser.phonenumber = result.user.phonenumber;
            _this._selectedUser.password = result.user.password;
            _this._selectedUser.roles = result.user.roles;
        }
        else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }   
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
        return this.first === (this._all_users.length - this.rows);
    }

    isFirstPage(): boolean {
        return this.first === 0;
    }

    openUserInfoModal(content) {
        if(this._selectedUser) {
            this.modalService.open(content, {backdropClass: 'light-grey-backdrop'});
        }
    }

    update() {
        let dataObject = {
            username : this._selectedUser.username,
            firstname: this._selectedUser.firstname,
            lastname: this._selectedUser.lastname,
            office: this._selectedUser.office,
            email: this._selectedUser.email,
            phonenumber: this._selectedUser.phonenumber,
            password: this._selectedUser.password,
            roles: this._selectedUser.roles
        }
        this._apiService.postData('User/Update', dataObject, this.updateCallback);                              
    }

    updateCallback(result, _this) {
        for(let user of _this._all_users) {
            if (user.username == result.user.username) {
                user.firstname = result.user.firstname;
                user.lastname = result.user.lastname;
                user.office = result.user.office;
                user.email = result.user.email;
                user.phonenumber = result.user.phonenumber;
                user.password = result.user.password;
                user.roles = result.user.roles;
            }
        }
        _this.messageService.add({key: 'updateUser_success', severity: 'success', summary: 'Success', detail: 'User has been updated'});
    }

    delConfirm() {
        this.messageService.clear();
        this.messageService.add({key: 'del_user', sticky: true, severity:'warn', summary:'Delete User?', detail:'Confirm to proceed'});
    }

    onReject() {
        this.messageService.clear('del_user');
    }

    delUser() {
        this.messageService.clear('del_user');
        let dataObject = {
            username: this._selectedUser.username
        }
        this._apiService.postData('User/Del', dataObject, this.delUserCallback);
    }

    delUserCallback(result, _this) {
        if(result.errorMessage == '') {
            _this._all_users = result.users;
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }
}

import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './ApiService';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem, MessageService } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Car } from './Models/Car';

@Component({
    selector: 'app-root',
    templateUrl: './app.page-e.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})

export class PageEComponent {
    token                 = '';
    _apiService:ApiService;
    _username:string = '';
    _first_name:string = '';
    _last_name:string =  '';
    _office:string = '';
    _email:string = '';
    _phone:string = '';
    _roles:string[] = [];
    _all_users:[] = null;

    // ---- Calendar ---- //
    today =  new Date();
    disable_dates = [
        new Date(new Date().setDate(this.today.getDate() + 1)),
        new Date(new Date().setDate(this.today.getDate() + 3)),
        new Date(new Date().setDate(this.today.getDate() + 7)),  
    ]

    // ---- Car Model ---- //
    _model: string = '';
    _make: string = '';
    _imgurl: string = '';
    _booked_user: string = '';
    _schedule: Date[] = [];
    _offices: SelectItem[];
    _cars: Car[] = [];
    _all_schedules: SelectItem[] = [{label: "", value: ""}];
    _selected_car: Car = null;
    _selected_schedule: Date[];

    _errorMessage:string = '';
    display_role:string = '';
    public site='http://localhost:1337/';

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
        this.messageService = messageService;
        this.getStaffData();
        this.getAllUser();
    }

    openCreateCarModal(content) {
        this.modalService.open(content, {backdropClass: 'light-grey-backdrop'});
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
            _this.getAllCars();
        }
        else {
            alert(JSON.stringify(result.errorMessage));
        }   
    }

    getAllCars() {
        this._apiService.getData('Car/ListAllCars', this.getAllCarsCallback)
    }

    getAllCarsCallback(result, _this) {
        var all_cars = [{ label: "", value: ""}];
        if(result.errorMessage == '') {
            _this._cars = result.cars;
            for(let car of result.cars) {
                all_cars.push({ label: car.model + ' ' + car.make, value: car});
            }
            _this._all_schedules = all_cars;
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }

    updateSchedule() {
        let dataObject = {
            car_id: this._selected_car.car_id,
            model: this._selected_car.model,
            make: this._selected_car.make,
            imgurl: "",
            office: this._selected_car.office,
            booked_user: this._selected_car.booked_user,
            schedule: this._selected_schedule
        }
        this._apiService.postData('Car/UpdateCar', dataObject, this.updateScheduleCallback);                              
    }

    updateScheduleCallback(result, _this) {
        _this.generateCarId();
        _this.messageService.add({key: 'updateCar_success', severity: 'success', summary: 'Success', detail: 'Booking has been submited'});
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

    generateCarId() {
        let car_id = 'AUTO-' + String(new Date().getTime()) + '-' + String(Math.floor(Math.random()*1000));
        console.log('Car ID: ' + car_id)
        return car_id;
    }

    createCar() {   
        let car_id = this.generateCarId();
        this._cars.forEach(car => {
            if(car_id == car.car_id)  {
                car_id = this.generateCarId();
            }
        });
        let newCar:Car = {
            car_id: car_id,
            model: this._model,
            make: this._make,
            imgurl: "",
            booked_user: this._booked_user,
            office: this._office,
            schedule: [],
        }
        this._apiService.postData('Car/CreateCar', newCar, this.createCarCallback);
    }

    createCarCallback(result, _this) {
        if(result.errorMessage == '') {
            _this.getAllCars();
        } else {
            console.log(JSON.stringify(result.errorMessage));
            _this._errorMessage = result.errorMessage;
        }
    }

    getAllUser() {
        this._apiService.getData('User/AllUsersWithSalary', this.getAllUserCallback);    
    }

    getAllUserCallback(result, _this) {
        _this._all_users = result.all_users;
    }

    getCarSchedule() {
        var schedules = []
        if(this._selected_car) {
            for(let date of this._selected_car.schedule) {
                schedules.push(new Date(date))
            }
            this._selected_schedule = schedules;
        } else (
            this._selected_schedule = null
        )
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

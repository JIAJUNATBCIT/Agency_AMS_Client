import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './ApiService';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.page-a.html',
    styleUrls: ['./app.component.css']
})

export class PageAComponent {
  // Hard-code credentials for convenience.
  password              = '111111';         
  username              = 'JiaJun';
  token                 = '';
  _roles:string[] = [];
  _apiService:ApiService;
  public site='http://localhost:1337/';
   
  // Since we are using a provider above we can receive 
  // an instance through an constructor.
  constructor(private http: HttpClient, private router: Router) {
    // Pass in http module and pointer to AppComponent.
    this._apiService = new ApiService(http, this);
  }

   //------------------------------------------------------------
   // Log user in. 
   //------------------------------------------------------------
  login() {
    let url = this.site + "auth";
   
    // This free online service receives post submissions.
    this.http.post(url, {
      username:  this.username,
      password:  this.password,
    }).subscribe( 
      // Data is received from the post request.
      (data) => {
        // Inspect the data to know how to parse it.
        //console.log(JSON.stringify(data));
        if(data["token"]  != null)  {
          this.token = data["token"]     
          sessionStorage.setItem('auth_token', data["token"]);
          this.router.navigate(['User/Profile'])
        }    
      },
      // An error occurred. Data is not received. 
      error => {
        alert(JSON.stringify(error));             
      });
   }

   //------------------------------------------------------------
   // Log user out. Destroy token.
   //------------------------------------------------------------
  logout() {
    sessionStorage.clear();
    // Clear data. 
    this.token = '';
    this._roles = [];
  }

  register() {
    this.router.navigate(['User/Register'])
  }
}

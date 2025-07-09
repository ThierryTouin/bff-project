// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './app.component.html',
  imports: [HttpClientModule],
  providers: [AuthService],
})
export class AppComponent {
  helloMessage: string = '';

  constructor(private authService: AuthService) {}

  login() {
    window.location.href = '/oauth2/authorization/keycloak';
  }

  logout() {
    window.location.href = '/logout';
  }

  callDirectPublicApi() {
    this.authService.callDirectPublicHello().subscribe(data => {
      this.helloMessage = data;
    });
  }

  callDirectSecuApi() {
    this.authService.callDirectSecuHello().subscribe(data => {
      this.helloMessage = data;
    });
  }

  callNginxPublicApi() {
    this.authService.callNginxPublicHello().subscribe(data => {
      this.helloMessage = data;
    });
  }

  callNginxSecuHello() {
    this.authService.callNginxSecuHello().subscribe(data => {
      this.helloMessage = data;
    });
  }


}

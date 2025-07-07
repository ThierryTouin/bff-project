// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
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

  callApi() {
    this.authService.callHello().subscribe(data => {
      this.helloMessage = data;
    });
  }
}

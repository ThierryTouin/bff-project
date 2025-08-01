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
    window.location.href = 'http://localhost:3001/oauth2/authorization/bff-client';
  }

  logout() {
    window.location.href = 'http://localhost:3001/logout';
  }

  callDirectPublicApi() {
    this.authService.callDirectPublicHello().subscribe(data => {
      this.helloMessage = data;
    });
  }

  userInfo() {
    this.authService.userInfo().subscribe(data => {
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

  postNginxSecuHello() {
    this.authService.postToNginx({ message: 'Hello from Angular' }).subscribe(data => {
      this.helloMessage = data;
    });
  }

}

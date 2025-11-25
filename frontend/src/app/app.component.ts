// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-auth',
  templateUrl: './app.component.html',
  imports: [HttpClientModule],
  providers: [AuthService],
})
export class AppComponent {
  helloMessage: string = '';

  //constructor(private authService: AuthService) {}

  clientId: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Réintégration d'AuthService
  ) {}

  ngOnInit() {
    // Lire les paramètres de l'URL
    this.route.queryParamMap.subscribe(params => {
      this.clientId = params.get('clientId');
      console.log('Client ID:', this.clientId);

      // Si le paramètre clientId est présent, déclencher l'authentification
      if (this.clientId) {
        this.triggerLogin();
      }
    });
  }

  triggerLogin() {
    // Rediriger vers le backend pour initier l'authentification OIDC
    window.location.href = `/autologin?clientId=${this.clientId}`;
  }

  login() {
    window.location.href = 'http://localhost:3001/oauth2/authorization/bff-client';
  }

  logout() {
    window.location.href = 'http://localhost:3001/logout';
  }

  swagger() {
    window.open('http://localhost:3001/swagger-ui/index.html', '_blank');
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

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private gtmId: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadGtmConfig();
  }

  private async loadGtmConfig(): Promise<void> {
    try {
      // Charge la configuration depuis un fichier JSON externe
      const config = await this.http.get<any>('assets/gtm-config.json').toPromise();
      this.gtmId = config.gtmId || environment.gtmId; // fallback sur environment si nécessaire

      if (this.gtmId) {
        this.initializeGtm();
      }
    } catch (error) {
      console.warn('Could not load GTM config, falling back to environment variable', error);
      this.gtmId = environment.gtmId;
      if (this.gtmId) {
        this.initializeGtm();
      }
    }
  }

  private initializeGtm(): void {
    if (this.gtmId && isPlatformBrowser(this.platformId)) {
      // Code d'initialisation GTM standard
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`;
      document.head.appendChild(script);
    }
  }

  /**
   * Méthode pour pousser des données à GTM
   * @param data Les données à pousser à GTM
   */
  pushData(data: any): void {
    if (this.gtmId && isPlatformBrowser(this.platformId) && (window as any).dataLayer) {
      (window as any).dataLayer.push(data);
    }
  }

  /**
   * Retourne l'ID GTM actuel
   */
  getGtmId(): string | null {
    return this.gtmId;
  }
}
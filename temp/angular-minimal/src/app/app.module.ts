import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AngularGtmService } from '@angular-extensions/gtm';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CommonModule],
  providers: [AngularGtmService],
  bootstrap: [AppComponent]
})
export class AppModule {}

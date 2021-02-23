import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { MaterialModule } from './../material.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [BrowserAnimationsModule, CommonModule, SharedModule, HomeRoutingModule, MaterialModule]
})
export class HomeModule {}

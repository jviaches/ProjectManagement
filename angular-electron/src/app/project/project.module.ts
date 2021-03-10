import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../shared/shared.module';

import { MaterialModule } from '../material.module';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { ProjectListComponent } from './project-list/project-list.component';

@NgModule({
  declarations: [ProjectManagementComponent, ProjectListComponent],
  imports: [BrowserAnimationsModule, CommonModule, SharedModule, MaterialModule],
  exports: [ProjectListComponent],
  providers: []
})
export class ProjectModule {}

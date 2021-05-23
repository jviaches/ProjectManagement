import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../shared/shared.module';

import { MaterialModule } from '../material.module';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { ProjectListComponent } from './project-list/project-list.component';

import { TaskNewComponent } from '../task/task-create/task-create.component';
import { TaskViewComponent } from '../task/task-view/task-view.component';
import { QuillModule } from 'ngx-quill';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ProjectManagementComponent, ProjectListComponent, TaskViewComponent, TaskNewComponent],
  imports: [BrowserAnimationsModule, CommonModule, SharedModule, MaterialModule, RouterModule, QuillModule.forRoot()],
  exports: [ProjectListComponent],
  providers: []
})
export class ProjectModule {}

import {  Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../core/models/project.model';
import { NotificationService} from '../../core/services/notification.service';
import { UtilsService } from '../../core/services/utils.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit  {

  task: Task;
  selectedValue: any;
  caption = '';
  editorText = '';
  quillConfiguration = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      // ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      // [{ color: [] }, { background: [] }],
      // ['link'],
      // ['clean'],
    ],
  }

  editorStyle = {
    height: '260px'
  };

  constructor(private notificationService: NotificationService, 
              private dialogRef: MatDialogRef<TaskViewComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: any,
              public utilsService: UtilsService) {

              console.log(this.utilsService.getColorByPriority('Minor'));
              
  }

  ngOnInit() {
    this.task = this.data.task;
    this.selectedValue = this.task.priority.valueOf();
    this.caption = this.task.title;
    this.editorText = this.task.content;
  }

  onContentChanged = (event) => {
    this.editorText = event.html;
  }

  updateEvent() {
    if (this.caption.trim().length === 0) {
      this.notificationService.showActionConfirmationFail('Action cancelled. Nothing was created.');
    } else {
      this.dialogRef.close({id: this.task.id, caption: this.caption, text:this.editorText, priority: this.selectedValue });
    }
  }

  cancel() {
    this.dialogRef.close('CANCEL');
  }
}

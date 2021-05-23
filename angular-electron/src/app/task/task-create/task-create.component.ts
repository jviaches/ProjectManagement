import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService} from '../../core/services/notification.service';
import { UtilsService } from '../../core/services/utils.service';

@Component({
  selector: 'app-task-new',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskNewComponent implements OnInit  {

  caption = '';
  selectedValue = '';
  editorText: '';
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
    height: '260px',
    width: '400px'
  };

  constructor(private notificationService: NotificationService, 
              private dialogRef: MatDialogRef<TaskNewComponent>,
              public utilsService: UtilsService) {
  }

  ngOnInit() {
  }

  onContentChanged = (event) => {
    this.editorText = event.html;
  }

  createEvent() {
    if (this.caption.trim().length === 0) {
      this.notificationService.showActionConfirmationFail('Action cancelled. Nothing was created.');
    } else {
      this.dialogRef.close({caption: this.caption, text:this.editorText, priority: this.selectedValue });
    }
  }

  cancel() {
    this.dialogRef.close('FAIL');
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService} from '../../core/services/notification.service';

@Component({
  selector: 'app-ticket-new',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss']
})
export class TicketNewComponent implements OnInit  {

  caption = '';
  editorText: '';
  quillConfiguration = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  }

  editorStyle = {
    height: '260px'
  };

  constructor(private notificationService: NotificationService, private dialogRef: MatDialogRef<TicketNewComponent>) {
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
      this.dialogRef.close({caption: this.caption, text:this.editorText });
    }
  }

  cancel() {
    this.dialogRef.close('FAIL');
  }
}

import {  Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Ticket } from '../../core/models/project.model';
import { NotificationService} from '../../core/services/notification.service';
import { DialogData } from '../../modals/modal-dialog/dialog-data';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit  {

  ticket: Ticket;
  caption = '';
  editorText = '';
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

  constructor(private notificationService: NotificationService, private dialogRef: MatDialogRef<TicketViewComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.ticket = this.data.ticket;
    this.caption = this.ticket.title;
    this.editorText = this.ticket.content;
  }

  onContentChanged = (event) => {
    this.editorText = event.html;
  }

  updateEvent() {
    if (this.caption.trim().length === 0) {
      this.notificationService.showActionConfirmationFail('Action cancelled. Nothing was created.');
    } else {
      this.dialogRef.close({id: this.ticket.id, caption: this.caption, text:this.editorText });
    }
  }

  cancel() {
    this.dialogRef.close('FAIL');
  }
}

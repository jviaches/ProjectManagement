import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-yesno-modal-dialog',
  templateUrl: 'yesno-modal-dialog.component.html',
  styleUrls: ['yesno-modal-dialog.component.scss']
})

export class ModalYesNoDialogComponent {

  public caption: 'Confirmation';
  public message: 'Are you sure ?';

  constructor(private dialogRef: MatDialogRef<ModalYesNoDialogComponent>) {
  }

  yes() {
    this.dialogRef.close('yes');
  }

  no() {
    this.dialogRef.close('no');
  }

}

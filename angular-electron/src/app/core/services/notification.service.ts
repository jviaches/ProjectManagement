import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ModalDialogComponent } from '../../modals/modal-dialog/modal-dialog.component';
import { ModalYesNoDialogComponent } from '../../modals/yesno-modal-dialog/yesno-modal-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private snackBar: MatSnackBar, private dialog: MatDialog) {
    }

    public showActionConfirmationSuccess(text: string) {
        const config = new MatSnackBarConfig();
        config.panelClass = ['snackBar-success'];
        config.duration = 3000;
        this.snackBar.open(text, null, config);
    }

    public showActionConfirmationWarning(text: string) {
        const config = new MatSnackBarConfig();
        config.panelClass = ['snackBar-warning'];
        config.duration = 3000;
        this.snackBar.open(text, null, config);
    }

    public showActionConfirmationFail(text: string) {
        const config = new MatSnackBarConfig();
        config.panelClass = ['snackBar-fail'];
        config.duration = 3000;
        this.snackBar.open(text, null, config).afterDismissed();
    }

    public showYesNoModalMessage(textMessage: string): Observable<any> {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = { data: { message: textMessage } };
        const dialogRef = this.dialog.open(ModalYesNoDialogComponent, dialogConfig);

        return dialogRef.afterClosed();
    }

    public showModalMessage(textCaption: string, textMessage: string): Observable<any> {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = { data: { message: textMessage, caption: textCaption } };

        const dialogRef = this.dialog.open(ModalDialogComponent, dialogConfig);

        return dialogRef.afterClosed();
    }

    public showModalComponent(component: any, textCaption: string, data: any): Observable<any> {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = { data: { caption: textCaption } };

        if (data) {
            dialogConfig.data = data;
        }

        dialogConfig.data.caption = textCaption;
        const dialogRef = this.dialog.open(component, dialogConfig);

        return dialogRef.afterClosed();
    }
}

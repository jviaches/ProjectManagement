import { Injectable, NgZone } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, dialog } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Project, Ticket } from '../../models/project.model';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TicketNewComponent } from '../../../ticket/ticket-create/ticket-create.component';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public static readonly PAGE_TITLE = 'ProjScope';

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  dialog: typeof dialog;

  project: BehaviorSubject<Project> = new BehaviorSubject(this.defaultProject);
  filePath: string = '';
  autosave: boolean = true;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(private ngZone: NgZone, private router: Router, private notificationService: NotificationService, private titleService: Title) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      // If you wan to use remote object, please set enableRemoteModule to true in main.ts
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.dialog = this.remote.dialog;

      this.ipcRenderer.on('new-project', (event, arg) => {
        this.ngZone.run(() => {
          this.newProject();
        });
      });

      this.ipcRenderer.on('save-project', (event, arg) => {
        this.ngZone.run(() => {
          if (this.project === null) {
            this.notificationService.showActionConfirmationFail('No active project!');
          } else {
            this.saveProject(JSON.stringify(this.project.value));
            this.notificationService.showActionConfirmationSuccess('Saved!');
          }
        });
      });

      this.ipcRenderer.on('save-as-project', (event, arg) => {
        this.ngZone.run(() => {
          if (this.project === null) {
            this.notificationService.showActionConfirmationFail('No active project!');
          } else {
            this.saveAsProject(JSON.stringify(this.project.value));
            this.notificationService.showActionConfirmationSuccess('Saved!');
          }
        });
      });

      this.ipcRenderer.on('auto-save-project', (event, status) => {
        this.ngZone.run(() => {
          this.notificationService.showActionConfirmationFail((status) ? ' Autosave enabled' : 'Autosave disabled');
          this.autosave = status;
        });
      });

      this.ipcRenderer.on('open-project', (event, arg) => {
        this.ngZone.run(() => {
          this.loadProject().then(value => {
            this.redirectTo('/project');
          });
        });
      });

      this.ipcRenderer.on('close-project', (event, arg) => {
        this.ngZone.run(() => {
          this.closeProject();
        });
      });


      this.ipcRenderer.on('exit', (event, arg) => {
        this.ngZone.run(() => {
          this.remote.getCurrentWindow().close();
        });
      });

      // this.ipcRenderer.on('about', (event, arg) => {
      //   this.ngZone.run(() => {
      //     this.notificationService.showModalComponent(AboutComponent, 'About', '').subscribe();
      //   });
      // });
    }
  }

  newProject() {
    const project = {
      name: 'Special Project',
      notes: 'notes..',
      avialableStatuses: [
        { id: 1, name: 'To Do' },
        { id: 2, name: 'In Progress' },
        { id: 3, name: 'Done' }
      ],
      avialableTags: [],
      tickets: [
        {
          id: 1,
          title: 'Ticket #1',
          content: 'some content...',
          statusId: 1,
          tags: [],
          creationDate: new Date()
        }
      ]
    };

    this.project.next(project);
    this.setPageTitle();
    this.redirectTo('/project');
  }

  updateProjectName(projName: string) {
    this.project.value.name = projName;
    this.project.next(this.project.value);
  }

  closeProject() {
    console.log('closing: ' + this.filePath);

    if (this.filePath !== '') {
      this.notificationService.showYesNoModalMessage().subscribe(response => {
        if (response === 'yes') {
          this.filePath = '';
          this.redirectTo('/');
        }
      });
    } else {
      this.filePath = '';
      this.redirectTo('/');
    }
  }

  saveProject(content: any) {
    console.log(this.filePath);
    console.log(content);


    if (this.filePath === '') {
      this.saveAsProject(content);
    } else {

      this.fs.writeFile(this.filePath, content, (err) => {
        if (err) {
          alert("An error ocurred updating the file" + err.message);
          console.log(err);
          return;
        }

        // alert("The file has been succesfully saved");
      });
    }
    this.setPageTitle();
  }

  saveAsProject(content: any) {
    var filepath = this.dialog.showSaveDialogSync(null, {
      properties: ['createDirectory'],
      filters: [
        { name: 'Project', extensions: ['txt'] },
      ]
    });

    // dialog was cancelled by user
    if (filepath === undefined) {
      return;
    } else {
      this.filePath = filepath;
    }

    this.fs.writeFile(filepath, content, (err) => {
      if (err) {
        alert("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      this.setPageTitle();
      // alert("The file has been succesfully saved");
    });
  }

  loadProject(): Promise<Project> {
    return new Promise<Project>((resolve) => {

      if (this.filePath !== '') {
        this.notificationService.showYesNoModalMessage().subscribe(response => {
          if (response === 'no') {
            resolve(this.project.value);
          } else {
            var file = this.dialog.showOpenDialogSync(null, {
              properties: ['openFile'],
              filters: [
                { name: 'Project', extensions: ['txt'] },
              ]
            });

            this.fs.readFile(file[0], 'utf-8', (err, data) => {
              if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
              }

              this.filePath = file[0];
              this.setPageTitle();
              this.project.next(JSON.parse(data));
              resolve(this.project.value);
            });
          }
        });
      } else {
        var file = this.dialog.showOpenDialogSync(null, {
          properties: ['openFile'],
          filters: [
            { name: 'Project', extensions: ['txt'] },
          ]
        });

        if (file !== undefined) {
          this.fs.readFile(file[0], 'utf-8', (err, data) => {
            if (err) {
              alert("An error ocurred reading the file :" + err.message);
              return;
            }

            this.filePath = file[0];
            this.setPageTitle();
            this.project.next(JSON.parse(data));
            resolve(this.project.value);
          });
        }
      }
    });
  }

  createTicket() {
    this.notificationService.showModalComponent(TicketNewComponent, '', {}).subscribe(result => {
      if (result !== 'FAIL') {
        const ticket: Ticket = {
          id: 10,
          title: result.caption,
          content: result.text,
          tags: [],
          statusId: 1,
          creationDate: new Date()
        }

        this.setPageTitle();
        this.project.value.tickets.push(ticket);
        this.project.next(this.project.value);
      }
    });
  }

  deleteTicket(ticketId: number) {
    this.notificationService.showYesNoModalMessage().subscribe(result => {
      if (result === 'yes') {
        const ticketIndex = this.project.value.tickets.findIndex(d => d.id === ticketId);
        this.project.value.tickets.splice(ticketIndex, 1);

        this.project.next(this.project.value);
      }
    });
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
  }


  public get defaultProject(): Project {
    const project = {
      name: 'Special Project',
      notes: 'notes..',
      avialableStatuses: [
        { id: 1, name: 'To Do' },
        { id: 2, name: 'In Progress' },
        { id: 3, name: 'Done' }
      ],
      avialableTags: [],
      tickets: [
        {
          id: 1,
          title: 'Ticket #1',
          content: 'some content...',
          statusId: 1,
          tags: [],
          creationDate: new Date()
        }
      ]
    };

    return project;
  }

  setPageTitle() {
    if (this.filePath === '') {
      this.titleService.setTitle(ElectronService.PAGE_TITLE);
    } else {
      this.titleService.setTitle(ElectronService.PAGE_TITLE + ' - ' + this.filePath);
    }
  }
}

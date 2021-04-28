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

  project: BehaviorSubject<Project> = new BehaviorSubject(null);
  filePath: string = '';
  autosave: boolean = false;
  lastTicketId: number = 1;

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
          this.newProject().then(value => {
            this.redirectTo('/project', false);
          });
        });
      });

      this.ipcRenderer.on('save-project', (event, arg) => {
        this.ngZone.run(() => {
          if (this.project === null) {
            this.notificationService.showActionConfirmationFail('No active project!');
          } else {
            console.log(this.project.value);
            
            this.saveProject(JSON.stringify(this.project.value));
            this.notificationService.showActionConfirmationSuccess('Saved!');
          }
        });

        this.ipcRenderer.send('close-project-enable', true)
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
        this.ipcRenderer.send('close-project-enable', true)
      });

      this.ipcRenderer.on('auto-save-project', (event, status) => {
        this.ngZone.run(() => {
          this.notificationService.showActionConfirmationFail((status) ? ' Autosave enabled' : 'Autosave disabled');
          this.autosave = status;
        });
        this.ipcRenderer.send('close-project-enable', true)
      });

      this.ipcRenderer.on('open-project', (event, arg) => {
        this.ngZone.run(() => {
          this.loadProject().then(value => {
            this.ipcRenderer.send('close-project-enable', true)
            this.redirectTo('/project', false);
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
          this.notificationService.showYesNoModalMessage(this.dialogContent()).subscribe(response => {
            if (response === 'yes') {
              this.exitProgram();
            }
          });
        });
      });
    }
  }

  exitProgram() {
    this.project = new BehaviorSubject(null);
    this.remote.getCurrentWindow().close();
  }

  newProject() {
    return new Promise<Project>((resolve) => {
      if (this.project.value === null) {
       
        this.ipcRenderer.send('close-project-enable', true)

        this.setPageTitle();
        this.project.next(this.defaultProject);
        this.setLastTicketId(this.defaultProject);
        resolve(this.project.value);
      } else {
        this.notificationService.showYesNoModalMessage(this.dialogContent()).subscribe(response => {
          if (response === 'yes') {
            this.ipcRenderer.send('close-project-enable', true)
            this.project.next(this.defaultProject);
            this.setPageTitle();
            this.setLastTicketId(this.defaultProject);
            resolve(this.project.value);
          }
        });
      }
    });
  }

  updateProjectName(projName: string) {
    this.project.value.name = projName;
    this.project.next(this.project.value);
  }

  closeProject() {
    this.notificationService.showYesNoModalMessage(this.dialogContent()).subscribe(response => {

      if (response === 'yes') {
        this.ipcRenderer.send('close-project-enable', false);
        this.project = new BehaviorSubject(null);
        this.filePath = '';
        this.setLastTicketId(null);
        this.redirectTo('/', false);
      }
    });
  }

  saveProject(content: any) {
    if (this.filePath === '') {
      this.saveAsProject(content);
    } else {

      this.fs.writeFile(this.filePath, content, (err) => {
        if (err) {
          alert("An error ocurred updating the file" + err.message);
          console.log(err);
          return;
        }
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

      this.ipcRenderer.send('close-project-enable', true);
      this.setPageTitle();
    });
  }

  loadProject(): Promise<Project> {
    return new Promise<Project>((resolve) => {

      if (this.filePath !== '') {
        this.notificationService.showYesNoModalMessage('').subscribe(response => {
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
              this.setLastTicketId(JSON.parse(data));
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
            this.setLastTicketId(JSON.parse(data));
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
          id: this.getNextTicketId(),
          title: result.caption,
          content: result.text,
          priority: result.priority,
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
    this.notificationService.showYesNoModalMessage('').subscribe(result => {
      if (result === 'yes') {
        const ticketIndex = this.project.value.tickets.findIndex(d => d.id === ticketId);
        this.project.value.tickets.splice(ticketIndex, 1);

        this.setLastTicketId(this.project.value);
        this.project.next(this.project.value);
      }
    });
  }

  redirectTo(uri: string, fromHomePage: boolean) {
    if (fromHomePage) {
      this.router.navigateByUrl(uri);
    } else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate([uri]));
    }
  }

  public get defaultProject(): Project {
    const project = {
      name: 'Project Name',
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
          priority: 1,
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

  dialogContent(): string {
    return this.filePath === '' ? 'Project is not saved!' : ''
  }

  getNextTicketId(): number {
    this.lastTicketId += 1;
    return this.lastTicketId;
  }

  setLastTicketId(project: Project) {
    if (!project) {
      this.lastTicketId = 1;
    } else {
      const maxTicketId = Math.max(...project.tickets.map(ticket => ticket.id));
      this.lastTicketId = maxTicketId;   
    }
    console.log( this.lastTicketId);
  }
}

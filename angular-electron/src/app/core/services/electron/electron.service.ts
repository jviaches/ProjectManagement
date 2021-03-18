import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, dialog } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Project } from '../../models/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  dialog: typeof dialog;
  project: Project;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      // If you wan to use remote object, please set enableRemoteModule to true in main.ts
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.dialog = this.remote.dialog;
    }
  }

  saveProject(content: any) {
    var filepath = "C:/Development/Electron/ProjectManagement/existinfile.txt";// you need to save the filepath when you open the file to update without use the filechooser dialog againg

    this.fs.writeFile(filepath, content, (err) => {
      if (err) {
        alert("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      // alert("The file has been succesfully saved");
    });
  }

  loadProject(): Promise<Project> {
    return new Promise<Project>((resolve) => {
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

        this.project = JSON.parse(data);
        resolve(this.project);
      });
    });
  }
}

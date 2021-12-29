import { Component } from "@angular/core";
import { ElectronService } from "../../core/services";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent {
  constructor(
    private electronService: ElectronService
  ) {}


  loadProject(): void {
    this.electronService.loadProject().then((value) => {
      this.electronService.ipcRenderer.send("close-project-enable", true);
      this.electronService.redirectTo("/project", false);
    });
  }

  newProject(): void {
    this.electronService.newProject().then((value) => {
      this.electronService.ipcRenderer.send("close-project-enable", true);
      this.electronService.redirectTo("/project", false);
    });
  }

  exitProject(): void {
    this.electronService.exitProgram();
  }
}

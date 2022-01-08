import { Component } from "@angular/core";
import { ElectronService } from "../../core/services";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-project-list",
  templateUrl: "./project-list.component.html",
  styleUrls: ["./project-list.component.scss"],
})
export class ProjectListComponent {
  constructor(
    private electronService: ElectronService,
    private notificationService: NotificationService
  ) {}

  loadProject(): void {
    this.electronService
      .loadProject()
      .then(() => {
        this.electronService.ipcRenderer.send("close-project-enable", true);
        this.electronService.redirectTo("/project", false);
      })
      .catch(() => {
        this.notificationService.showModalMessage(
          "Error",
          "Unable to load file!"
        );
      });
  }

  newProject(): void {
    this.electronService.newProject().then(() => {
      this.electronService.ipcRenderer.send("close-project-enable", true);
      this.electronService.redirectTo("/project", false);
    });
  }

  exitProject(): void {
    this.electronService.exitProgram();
  }
}

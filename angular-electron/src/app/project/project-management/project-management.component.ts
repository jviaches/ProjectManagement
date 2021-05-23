import { Component, OnInit } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Project, Tag, Task } from "../../core/models/project.model";
import { NotificationService } from "../../core/services/notification.service";
import { TaskViewComponent } from "../../task/task-view/task-view.component";
import { ElectronService } from "../../core/services";
import { Priority, PriorityColor } from "../../core/models/priority.model";
import { UtilsService } from "../../core/services/utils.service";

interface Dictionary<T> {
  [Key: string]: Task[];
}

@Component({
  selector: "app-project-management",
  templateUrl: "./project-management.component.html",
  styleUrls: ["./project-management.component.scss"],
})
export class ProjectManagementComponent implements OnInit {
  public project: Project = null;
  public connectedSections: Array<string> = [];
  public sectionsTasks: Dictionary<string> = {};
  public editProjectName: boolean = false;

  caption = "";
  quillConfiguration = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      // ['blockquote', 'code-block'],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      // [{ color: [] }, { background: [] }],
      // ['link'],
      // ['clean'],
    ],
  };

  editorStyle = {
    height: "260px",
    background: "white",
  };

  constructor(
    private electronService: ElectronService,
    private notificationService: NotificationService,
    public utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.electronService.project.subscribe((project) => {
        this.project = project;
        this.recalculateData();
      },
      (error) => {}
    );
  }

  public get sectiondIds(): string[] {
    return Object.keys(this.sectionsTasks);
  }

  public get projectCopletionPecentage(): Number {
    let taskAmount = 0;
    this.project.sections.map((a) => (taskAmount += a.tasks.length));

    if (this.project === null || taskAmount === 0) {
      return 0;
    }

    const lastSection = this.project.sections[this.project.sections.length - 1];

    return Math.round((lastSection.tasks.length / taskAmount) * 100);
  }

  tags: Tag[] = [
    { id: 1, name: "Ui design", color: "blue" },
    { id: 2, name: "First Bug", color: "red" },
    { id: 3, name: "Wont Fix", color: "yellow" },
  ];

  taskDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const startIndex = "cdk-drop-list-".length;
      const sectionOrderId = event.container.id.substring(startIndex, event.container.id.length);

      let sectionTasks: Task[] = [];
      event.container.data.map((str, index) =>
        sectionTasks.push(JSON.parse(JSON.stringify(str)))
      );
      this.project.sections[Number(sectionOrderId) - 1].tasks = sectionTasks;
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // remove task from old section
      const prevSectionId = Number(event.previousContainer.id.replace("cdk-drop-list-", ""));
      const movedTask: Task = <Task>(event.container.data[event.currentIndex] as unknown);

      const taskIndex = this.project.sections[Number(prevSectionId) - 1].tasks.indexOf(movedTask); 
      if (taskIndex !== -1) {
        this.project.sections[Number(prevSectionId) - 1].tasks.splice(taskIndex, 1);
      }

      // add task to new section
      const startIndex = "cdk-drop-list-".length;
      const sectionOrderId = event.container.id.substring(startIndex, event.container.id.length);

      let sectionTasks: Task[] = [];
      event.container.data.map((str, index) =>
        sectionTasks.push(JSON.parse(JSON.stringify(str)))
      );
      this.project.sections[Number(sectionOrderId) - 1].tasks = sectionTasks;
    }

    this.recalculateData();
    this.electronService.setDataChange();

    if (this.electronService.autosave) {
      this.electronService.saveProject(JSON.stringify(this.project));
    }
  }

  tagDrop(event: CdkDragDrop<string[]>) {
    // console.log(
    //   "tag `" +
    //     event.item.element.nativeElement.textContent +
    //     `' + dropped on ` +
    //     event.container.id
    // );

    // transferArrayItem(event.previousContainer.data,
    //      event.container.data,
    //      event.previousIndex,
    //      event.currentIndex);
  }

  viewTask(task: Task) {
    this.notificationService
      .showModalComponent(TaskViewComponent, "", { task })
      .subscribe((result) => {
        if (result !== "CANCEL") {
          const viewedTask = this.getTaskById(task.id);

          for (let index = 0; index < this.project.sections.length; index++) {
            const element = this.project.sections[index];
            const indexResult = element.tasks.findIndex((task) => task.id === viewedTask.id );

            if (indexResult !== -1) {
              // task found

              if (this.project.sections[index].tasks[indexResult].title !== result.caption) {
                this.project.sections[index].tasks[indexResult].title = result.caption;
                this.electronService.setDataChange();
              }

              if (this.project.sections[index].tasks[indexResult].content !== result.text) {
                this.project.sections[index].tasks[indexResult].content = result.text;
                this.electronService.setDataChange();
              }

              if (this.project.sections[index].tasks[indexResult].priority !== result.priority) {
                this.project.sections[index].tasks[indexResult].priority = result.priority;
                this.electronService.setDataChange();
              }

              break;
            }
          }
        }
      });
  }

  deleteTask(taskId: number, sectionIndex: number) {
    this.electronService.deleteTask(taskId, sectionIndex);
  }

  createTask() {
    this.electronService.createTask();
  }

  onContentChanged = (event) => {
    this.project.notes = event.html;
    this.electronService.setDataChange();

    if (this.electronService.autosave) {
      this.electronService.saveProject(JSON.stringify(this.project));
    }
  };

  setProjectNameEditMode() {
    if (this.editProjectName) {
      this.electronService.updateProjectName(this.project.name);
    }
    this.editProjectName = !this.editProjectName;
  }

  private recalculateData() {
    if (this.project === null) {
      return;
    }

    this.connectedSections = [];
    this.sectionsTasks = {};

    if (this.project.sections.length > 0) {
      this.project.sections.map((section) =>
        this.connectedSections.push("cdk-drop-list-" + section.orderIndex)
      );
      this.project.sections.map((section) =>
          (this.sectionsTasks["cdk-drop-list-" + section.orderIndex] = [])
      );

      this.project.sections.forEach((section) => {
        section.tasks.forEach((task) => {
          this.sectionsTasks["cdk-drop-list-" + section.orderIndex].push(task);
        });
      });
    }
  }

  sectionId(id: string): Number {
    return this.sectionsTasks["cdk-drop-list-" + id]
      ? this.sectionsTasks["cdk-drop-list-" + id].length
      : 0;
  }

  taskPriority(task: Task) {
    return task ? task.priority : "";
  }

  setTaskColor(priority: Priority) {
    if (priority == Priority.Minor) {
      return PriorityColor.Minor;
    }

    if (priority == Priority.Normal) {
      return PriorityColor.Normal;
    }

    if (priority == Priority.High) {
      return PriorityColor.High;
    }

    if (priority == Priority.Critical) {
      return PriorityColor.Critical;
    }
  }

  private getTaskById(taskId: number): Task {
    let foundTask = null;

    for (let index = 0; index < this.project.sections.length; index++) {
      const element = this.project.sections[index];
      const indexResult = element.tasks.findIndex((task) => task.id === taskId);
      if (indexResult !== -1) {
        // task found
        foundTask = this.project.sections[index].tasks[indexResult];
        break;
      }
    }

    return foundTask;
  }
}

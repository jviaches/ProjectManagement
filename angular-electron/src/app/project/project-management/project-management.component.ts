import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Project, Ticket } from '../../core/models/project.model'
import { NotificationService } from '../../core/services/notification.service';
import { TicketViewComponent } from '../../ticket/ticket-view/ticket-view.component';
import { ElectronService } from '../../core/services';

interface Dictionary<T> {
  [Key: string]: Ticket[];
}

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {

  public project: Project = null;
  public connectedSections: Array<string> = [];
  public sectionsTickets: Dictionary<string> = {};
  public editProjectName: boolean = false;

  caption = '';
  quillConfiguration = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      // ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      // [{ color: [] }, { background: [] }],
      // ['link'],
      // ['clean'],
    ],
  }

  editorStyle = {
    height: '260px',
    background: 'white'
  };

  constructor(private electronService: ElectronService, private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.electronService.project.subscribe(project => {
      this.project = project;
      this.recalculateData();
    });
  }

  public get sectiondIds(): string[] {
    return Object.keys(this.sectionsTickets);
  }

  public get projectCopletionPecentage(): Number {
    if (this.project === null || this.project.tickets.length === 0) {
      return 0;
    }

    const allTickets = this.project.tickets.length;
    const completedTickets = this.project.tickets.filter(ticket => ticket.statusId === 3).length;

    return Math.round(completedTickets / allTickets * 100);
  }

  tags = [
    { id: 1, name: 'Ui design' },
    { id: 2, name: 'First Bug' },
    { id: 3, name: 'wont Fix' },
  ];

  taskDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ticketId = event.previousContainer.data[event.previousIndex]['id'];
      const ticket = this.project.tickets.find(ticket => ticket.id === ticketId);
      const statusId = event.container.id.split('cdk-drop-list-')[1];

      console.log('Moving ticket: ' + ticket);
      console.log('Old status: ' + statusId);

      ticket.statusId = Number(statusId);      

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      console.log(this.project.tickets);
    }

    if (this.electronService.autosave) {
      this.electronService.saveProject(JSON.stringify(this.project));
    }
  }

  tagDrop(event: CdkDragDrop<string[]>) {
    console.log('tag `' + event.item.element.nativeElement.textContent + `' + dropped on ` + event.container.id);

    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex);
    // }
  }

  viewTicket(ticket: Ticket) {
    this.notificationService.showModalComponent(TicketViewComponent, '', { ticket }).subscribe(result => {
      if (result !== 'FAIL') {
        const ticketIndex = this.project.tickets.findIndex(d => d.id === result.id);
        this.project.tickets[ticketIndex].title = result.caption;
        this.project.tickets[ticketIndex].content = result.text;
      }
    });
  }

  deleteTicket(ticketId: number) {
    this.electronService.deleteTicket(ticketId);
  }

  createTicket() {
    this.electronService.createTicket();    
  }

  onContentChanged = (event) => {
    this.project.notes = event.html;
    if (this.electronService.autosave) {
      this.electronService.saveProject(JSON.stringify(this.project));
    }
  }

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
    this.sectionsTickets = {};

    if (this.project.avialableStatuses.length > 0 && this.project.tickets.length > 0) {
      this.project.avialableStatuses.map(status => this.connectedSections.push('cdk-drop-list-' + status.id));
      this.project.avialableStatuses.map(status => this.sectionsTickets['cdk-drop-list-' + status.id] = []);

      this.project.tickets.map(ticket => {
        this.sectionsTickets['cdk-drop-list-' + ticket.statusId].push(ticket);
      });
    }
  }

  sectionId(id: string): Number {
      return this.sectionsTickets['cdk-drop-list-' + id] ? this.sectionsTickets['cdk-drop-list-' + id].length : 0;
  }
}

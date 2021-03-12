import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Project, Ticket } from '../../core/models/project.model'
import { NotificationService } from '../../core/services/notification.service';
import { TicketNewComponent } from '../../ticket/ticket-create/ticket-create.component';

interface Dictionary<T> {
  [Key: string]: Ticket[];
}

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {

  public project: Project;
  public connectedSections:  Array<string> = [];
  public sectionsTickets: Dictionary<string> = {};

  constructor(private router: Router, private notificationService: NotificationService) { 
    this.project = {
      id: 1,
      name: 'Special Project',
      description: 'description..',
      avialableStatuses: [
        {id: 1, name: 'To Do'},
        {id: 2, name: 'In Progress'},
        {id: 3, name: 'Done'}
      ],
      avialableTags: [],
      tickets: [
        {
          id: 1,
          title: 'Ticket #1',
          content: 'some content...',
          statusId: 1,
          tags: [
            {id: 1, name: 'Infastructure', color: ''},
            {id: 2, name: 'UI', color: ''},
            {id: 3, name: 'Architectrure', color: ''},
          ]
        },
        {
          id: 2,
          title: 'Ticket #2',
          content: 'some content...',
          statusId: 2,
          tags: []
        },
        {
          id: 3,
          title: 'Ticket #3 - extra extra extra long caption',
          content: 'some content...',
          statusId: 3,
          tags: []
        }
      ]
    };

    this.recalculateData();
  }

  ngOnInit(): void {
  }
  
  public get sectiondIds() : string[] {
    return Object.keys(this.sectionsTickets);
  }
  
  tags = [
    {id: 1, name:'Ui design'},
    {id: 2, name:'First Bug'},
    {id: 3, name:'wont Fix'},
  ];

  taskDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ticketId = event.previousContainer.data[event.previousIndex]['id'];
      const ticket = this.project.tickets.find(ticket => ticket.id === ticketId);

      const statusId = event.container.id.split('cdk-drop-list-')[1];
      ticket.statusId = Number(statusId);

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
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

  deleteTicket(ticketId: number) {
    this.notificationService.showYesNoModalMessage().subscribe( result => {
      if (result === 'yes') {
        const ticketIndex = this.project.tickets.findIndex(d => d.id === ticketId);
        this.project.tickets.splice(ticketIndex, 1);
      }
    });
  }

  createTicket() {
    this.notificationService.showModalComponent(TicketNewComponent, '', {}).subscribe( result => {
       if (result !== 'FAIL') {
        const ticket: Ticket = {
          id: 10,
          title: result.caption,
          content: result.text,
          tags: [],
          statusId: 2
        }
       
        this.project.tickets.push(ticket);
        this.recalculateData();
       }
    });
  }

  private recalculateData() {
    this.connectedSections = [];
    this.sectionsTickets = {};

    this.project.avialableStatuses.map(status => this.connectedSections.push('cdk-drop-list-' + status.id));
    this.project.tickets.map(ticket => {
      if (this.sectionsTickets['cdk-drop-list-' + ticket.statusId] === undefined) {
        this.sectionsTickets['cdk-drop-list-' + ticket.statusId] = [];
        this.sectionsTickets['cdk-drop-list-' + ticket.statusId].push(ticket);
      } else {
        this.sectionsTickets['cdk-drop-list-' + ticket.statusId].push(ticket);
      }      
    });
  }
}

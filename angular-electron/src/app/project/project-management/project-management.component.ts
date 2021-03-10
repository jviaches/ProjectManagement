import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Project, Ticket } from '../../core/models/project.model'

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

  constructor(private router: Router) { 
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

    this.project.avialableStatuses.map(status => this.connectedSections.push('cdk-drop-list-' + status.id));
    this.project.tickets.map(ticket => {
      if (this.sectionsTickets['cdk-drop-list-' + ticket.id] === undefined) {
        this.sectionsTickets['cdk-drop-list-' + ticket.id] = [];
        this.sectionsTickets['cdk-drop-list-' + ticket.id].push(ticket);
      } else {
        this.sectionsTickets['cdk-drop-list-' + ticket.id].push(ticket);
      }      
    });
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

  // todo = [
  //   {id: 1, name:'Get to work'},
  //   'Pick up groceries',
  //   'Go home',
  //   'Fall asleep'
  // ];


  // inProgress = [
  //   'Task1',
  //   'Task2',
  //   'Task3',
  //   'Task4'
  // ];

  // done = [
  //   'Get up',
  //   'Brush teeth',
  //   'Take a shower',
  //   'Check e-mail',
  //   'Walk dog'
  // ];

  taskDrop(event: CdkDragDrop<string[]>) {
    //console.log('ticket dropped' + event);

    if (event.previousContainer === event.container) {
      console.log(event.container.data);
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
    const ticketIndex = this.project.tickets.findIndex(d => d.id === ticketId);
    this.project.tickets.splice(ticketIndex, 1);
  }
}

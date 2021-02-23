import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Project } from '../../core/models/project.model'

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {

  public project: Project;
  constructor(private router: Router) { }

  tags = [
    'Ui design',
    'First Bug',
    'wont Fix',
  ];

  todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];


  inProgress = [
    'Task1',
    'Task2',
    'Task3',
    'Task4'
  ];

  done = [
    'Get up',
    'Brush teeth',
    'Take a shower',
    'Check e-mail',
    'Walk dog'
  ];

  taskDrop(event: CdkDragDrop<string[]>) {
    console.log('ticket dropped' + event);
    
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
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

  ngOnInit(): void {
    // this.project = {
    //   id: 1,
    //   name: 'Special Project',
    //   description: 'description..',
    //   statuses: [],
    //   tags: [],
    //   tickets: [
    //     {
    //       id: 1,
    //       title: 'Konsep hero title yang menarik',
    //       content: 'some content...',
    //       status: null,
    //       tags: []
    //     },
    //     {
    //       id: 2,
    //       title: 'Icon di section our services',
    //       content: 'some content...',
    //       status: null,
    //       tags: []
    //     },
    //     {
    //       id: 3,
    //       title: 'Konsep hero title yang menarik',
    //       content: 'some content...',
    //       status: null,
    //       tags: []
    //     }
    //   ]
    // };
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../core/models/project.model'

@Component({
  selector: 'app-project-lsit',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  public project: Project;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
}

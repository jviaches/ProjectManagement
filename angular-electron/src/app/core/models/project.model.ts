import { Priority } from "./priority.model";

export interface Project {
    version: string;
    name: string;
    notes: string;
    avialableStatuses: Status[];
    avialableTags: Tag[];
    tickets: Ticket[]
}

export interface Tag {
    id: number;
    name: string;
    color: string;
}

export class Ticket {
    id: number;
    title: string = '';
    content: string = '';
    priority: Priority;
    tags: Tag[] = [];
    statusId: number;
    creationDate: Date;
}

export interface Status {
    id: number;
    name: string;
}
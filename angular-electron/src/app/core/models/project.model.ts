export interface Project {
    id: number;
    name: string;
    description: string;
    statuses: Status[];
    tags: Tag[];
    tickets: Ticket[]
}

export interface Tag {
    id: number;
    name: string;
}

export interface Ticket {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    status: Status;
}

export interface Status {
    id: number;
    name: string;
}
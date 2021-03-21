
export interface Project {
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

export interface Ticket {
    id: number;
    title: string;
    content: string;
    tags: Tag[];
    statusId: number;
    creationDate: Date;
}

export interface Status {
    id: number;
    name: string;
}
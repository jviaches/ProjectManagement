

import { Injectable } from '@angular/core';
import { Priority, PriorityColor, PriorityItem } from '../models/priority.model';

@Injectable({
    providedIn: 'root'
  })
  export class UtilsService {



    priorities: PriorityItem[] = [
        {value: Priority.Minor.valueOf(), viewValue: Priority[0]},
        {value: Priority.Normal.valueOf(), viewValue: Priority[1]},
        {value: Priority.High.valueOf(), viewValue: Priority[2]},
        {value: Priority.Critical.valueOf(), viewValue: Priority[3]},
    ];

    priorityColors = new Map<string, string>([
      [PriorityColor.Minor, 'Minor'],
      [PriorityColor.Normal, 'Normal'],
      [PriorityColor.High, 'High'],
      [PriorityColor.Critical, 'Critical'],
    ]);

    getColorByPriority(priority: string): string  {
      console.log(this.priorityColors);

      return [...this.priorityColors].find(([key, val]) => val == priority)[0]
    }
}
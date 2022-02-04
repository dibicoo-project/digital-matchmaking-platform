import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@domain/notifications/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  constructor(public service: NotificationService) { }

  ngOnInit(): void {
    this.service.fetch();
  }

}

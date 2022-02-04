import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from '@domain/dialog.service';
import { NotificationService } from '@domain/notifications/notification.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-send-notifications',
  templateUrl: './send-notifications.component.html',
  styleUrls: ['./send-notifications.component.scss']
})
export class SendNotificationsComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dialog: DialogService,
    private service: NotificationService,
    private router: Router) { }

  messageForm = this.fb.group({
    title: [],
    body: [],
    links: this.fb.array([
      this.fb.group({ label: [], url: [] }),
      this.fb.group({ label: [], url: [] }),
    ])
  });

  ngOnInit(): void {
  }

  preview(ref) {
    const data = this.messageForm.value;
    data.links = data.links.filter(l => !!l.label && !!l.url);
    this.dialog.open(ref, { data }).afterClosed()
      .pipe(
        filter(res => res === true),
        switchMap(() => this.service.sendAdminNotification(data))
      )
      .subscribe(() => this.router.navigate(['/user/notifications']));
  }

}

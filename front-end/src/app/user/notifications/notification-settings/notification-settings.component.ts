import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@domain/notifications/notification.service';
import { AuthService } from '@root/app/auth/auth.service';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private service: NotificationService,
    private router: Router) { }

  settingsForm = this.fb.group({
    enabled: [false, Validators.required],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.service.getSettings()
      .pipe(
        switchMap(data => {
          if (!data.email) {
            return this.auth.userProfile$.pipe(
              map(profile => ({ enabled: data.enabled, email: profile.email }))
            );
          } else {
            return of(data);
          }
        })
      )
      .subscribe(data => this.settingsForm.patchValue(data));

    this.settingsForm.get('enabled').valueChanges.subscribe(enabled => {
      if (enabled) {
        this.settingsForm.get('email').enable();
      } else {
        this.settingsForm.get('email').disable();
      }
    });
  }

  save() {
    this.service.saveSettings(this.settingsForm.value).subscribe(_ => this.router.navigate(['/user/notifications']));
  }
}

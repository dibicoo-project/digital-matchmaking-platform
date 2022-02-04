import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '@domain/application.service';
import { Application } from '@domain/application-domain';


@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {

  applications: Application[];

  constructor(private service: ApplicationService) { }

  ngOnInit(): void {
    this.service.getApplications()
      .subscribe(applications => {
        this.applications = applications;
      });
  }

}

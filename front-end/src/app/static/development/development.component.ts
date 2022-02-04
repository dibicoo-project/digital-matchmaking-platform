import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.scss']
})
export class DevelopmentComponent implements OnInit {

  done = [
    "Defined list of company categories",
    "Implemented Log In / Sign Up functionality",
    "Company profile registration feature",
    "Publishing of a company profile",
    "Developed platform administrator’s functionality",
    "Published company profile search",
    "Company profiles are presented on a global map",
    "Summary on the number of companies and sub-categories for each category",
    "Reference projects feature added to a company profiles",
    "Company main projects are presented on a global map",
    "Sharing functionality of an existing company profile",
    "Implemented registration and publishing of a business opportunities",
    "Introduced inappropriate content reporting for business opportunities",
    "Knowledge base section is added",
    "Factsheets related to biogas sector included into Knowledge base",
    "Summarized biogas and gasification literature sources",
    "Main page of the platform is designed",
    "Created platform navigation menu",
    "Privacy statement is added to the platform",
    "Published platform user manual",
    "Implementation of guided process for company profile creation",
    "User notifications for platform internal events",
    "Implemented guided process for business opportunity creation",
    "Branding and marketing information upload for company profiles",
    "Company profile visit statistics and reports for a managers",
    "Developed a frequently asked question section",
    "Fair guiding principles are added to the platform",
    "Option to send feedback via a survey is avaialble for the platform users",
  ];

  comingSoon = [
    "Business opportunities visit statistics and reports for a managers",
    "Semi-automated matchmaking of business applications to registered companies",
    "Implementation of guided tour for the platform",
    "Communication features between platform users and administrators",
    "E-mail notifications for the platform users",
    "and more...",
  ];

  constructor() { }

  ngOnInit(): void {
  }

}

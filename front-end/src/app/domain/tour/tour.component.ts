import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as introJs from 'intro.js';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  startTour() {
    let snap = this.route.snapshot;
    // find last child
    while (snap.firstChild) {
      snap = snap.firstChild;
    }

    introJs()
      .setOptions({ showBullets: false, showProgress: true })
      .addSteps(
        snap.data.tour.filter(step => document.querySelector(step.element) !== null)
      )
      .start();
  }

}

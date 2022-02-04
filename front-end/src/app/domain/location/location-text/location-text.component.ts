import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@domain/common-domain';

@Component({
  selector: 'app-location-text',
  templateUrl: './location-text.component.html',
  styleUrls: ['./location-text.component.css']
})
export class LocationTextComponent implements OnInit {

  @Input()
  location: Location;

  constructor() { }

  ngOnInit(): void {
  }

}

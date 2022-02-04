import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-avatar',
  templateUrl: './image-avatar.component.html',
  styleUrls: ['./image-avatar.component.css']
})
export class ImageAvatarComponent implements OnInit {

  imageLoaded = false;

  @Input() title: string;
  @Input() imageUrl: string;
  @Input() text: string;
  @Input() hue: number;

  constructor() { }

  ngOnInit(): void {
  }

}

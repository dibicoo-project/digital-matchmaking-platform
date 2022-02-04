import { Component, OnInit } from '@angular/core';
import { FiltersBean } from '@domain/application-domain';
import { ApplicationService } from '@domain/application.service';

@Component({
  selector: 'app-application-saved-matchmaking',
  templateUrl: './application-saved-matchmaking.component.html',
  styleUrls: ['./application-saved-matchmaking.component.scss']
})
export class ApplicationSavedMatchmakingComponent implements OnInit {

  list: FiltersBean[];

  constructor(private service: ApplicationService) { }

  ngOnInit(): void {
    this.service.getSavedMatchmaking().subscribe(list => this.list = list);
  }

  delete(id: string) {
    const idx = this.list.findIndex(i => i.id === id);
    if (idx > -1) {
      const [item] = this.list.splice(idx, 1);

      this.service.deleteMatchmaking(id)
        .subscribe(
          _ok => null,
          _err => this.list.splice(idx, 0, item)
        );
    }
  }

}

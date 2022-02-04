import { Component, OnInit } from '@angular/core';
import { FiltersBean } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';

@Component({
  selector: 'app-enterprise-saved-matchmaking',
  templateUrl: './enterprise-saved-matchmaking.component.html',
  styleUrls: ['./enterprise-saved-matchmaking.component.scss']
})
export class EnterpriseSavedMatchmakingComponent implements OnInit {

  list: FiltersBean[];

  constructor(private service: EnterpriseService) { }

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { DomSanitizer } from '@angular/platform-browser';

const material = [
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatDividerModule,
  MatCardModule,
  MatToolbarModule,
  MatSidenavModule,
  MatMenuModule,
  FlexLayoutModule,
  MatBadgeModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatTreeModule,
  TextFieldModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatProgressBarModule,
  MatSelectModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatDialogModule,
  ClipboardModule,
  MatButtonToggleModule,
  MatPaginatorModule,
  MatTooltipModule,
  MatTableModule,
  MatSortModule,
  MatExpansionModule,
  MatRadioModule
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...material
  ],
  exports: [
    ...material
  ]
})
export class DiBiCooMaterialModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitazer: DomSanitizer) {
    this.registerCustomIcon('business-opportunities');
    this.registerCustomIcon('companies-explorer');
    this.registerCustomIcon('companies-global-map');
    this.registerCustomIcon('companies-matchmaking');
    this.registerCustomIcon('factsheets');
    this.registerCustomIcon('literature-sources');
    this.registerCustomIcon('videos-and-links');
  }

  private registerCustomIcon(name: string) {
    this.matIconRegistry.addSvgIcon(name,
      this.domSanitazer.bypassSecurityTrustResourceUrl(`../assets/icons/${name}.svg`)
    );
  }
}

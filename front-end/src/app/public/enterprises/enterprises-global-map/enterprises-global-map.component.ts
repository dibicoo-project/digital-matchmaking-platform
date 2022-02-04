import { Component, OnInit } from '@angular/core';
import { Enterprise, KeyProject } from '@domain/enterprises/enterprise-domain';
import { Category } from '@domain/categories/category-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { CategoryService } from '@domain/categories/category.service';
import { forkJoin } from 'rxjs';
import { CountriesService } from '@domain/countries/countries.service';
import { Country } from '@domain/countries/country-domain';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';

@Component({
  selector: 'app-enterprises-global-map',
  templateUrl: './enterprises-global-map.component.html',
  styleUrls: ['./enterprises-global-map.component.scss']
})
export class EnterprisesGlobalMapComponent implements OnInit {
  private enterprises: Enterprise[] = [];
  enterprisesVisible: Enterprise[] = [];
  projectsVisible: KeyProject[] = [];
  categories: Category[] = [];
  selectedCategoryId: string;

  options: string[] = [];

  private gasId: string;
  private adId: string;
  private openWindow: any;
  countries: Country[];

  mediaAccepted = false;

  constructor(public service: EnterpriseService,
    private categoryService: CategoryService,
    private countriesService: CountriesService,
    public cookies: DiBiCooCookieService) { }

  ngOnInit() {
    if (this.cookies.checkMedia()) {
      this.mediaAccepted = true;

      forkJoin([
        this.service.getEnterprises(),
        this.categoryService.getRootCategories()
      ]).subscribe(([enterprises, categories]) => {
        this.enterprises = enterprises.filter(e => e.displayOnGlobalMap && e.latlng && e.latlng[0] != null && e.latlng[1] != null);
        this.categories = categories;

        this.gasId = this.categories.find(c => c.isGAS)?.id;
        this.adId = this.categories.find(c => c.isAD)?.id;

        this.selectedCategoryId = this.adId;
        this.updateMarkers();
      });

      this.countriesService.all$.subscribe(list => this.countries = list);
    }
  }

  markerClicked(iw: any = null) {
    if (this.openWindow) {
      this.openWindow.close();
    }
    this.openWindow = iw;
  }

  getMarkerIcon() {
    if (this.selectedCategoryId === this.gasId) {
      return 'assets/marker_greenG.png';
    } else if (this.selectedCategoryId === this.adId) {
      return 'assets/marker_blueA.png';
    }
  }

  getProjectMarkerIcon() {
    return `assets/marker_red.png`;
  }

  updateMarkers() {
    this.markerClicked();
    this.enterprisesVisible = this.enterprises.filter(e => e.categoryIds.includes(this.selectedCategoryId))
      .sort((a, b) => a.latlng[0] > b.latlng[0] ? -1 : 1); // for correct marker overlay
    this.updateProjectsMarkers();
  }

  updateProjectsMarkers() {
    this.markerClicked();
    this.projectsVisible = [];
    if (this.options.includes('keyProjects')) {
      const res: KeyProject[] = [];
      this.enterprisesVisible.forEach(company => {
        (company.keyProjects || [])
          .filter(p => p.showOnMap && p.latlng && p.latlng[0] && p.latlng[1])
          .forEach(p => {
            this.projectsVisible.push({
              ...p,
              company,
              //TO-FIX with marker clusters: workaround for markers at the same place
              latlng: [p.latlng[0] + Math.random() * 0.2 - 0.1, p.latlng[1] + Math.random() * 0.2 - 0.1]
            });
          });
      });
    }
  }

}

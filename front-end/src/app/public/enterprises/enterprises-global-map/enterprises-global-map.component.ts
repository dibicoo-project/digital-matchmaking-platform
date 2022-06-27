import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Enterprise, KeyProject } from '@domain/enterprises/enterprise-domain';
import { Category } from '@domain/categories/category-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { CategoryService } from '@domain/categories/category.service';
import { forkJoin, from } from 'rxjs';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';
import { environment } from '@root/environments/environment';
import { Cluster, ClusterStats, MarkerClusterer, Renderer } from '@googlemaps/markerclusterer';
import { Loader } from '@googlemaps/js-api-loader';

class SingleColorClusterRenderer implements Renderer {
  constructor(public color = 'black') { }

  render(cluster: Cluster, stats: ClusterStats): google.maps.Marker {
    const svg = window.btoa(`
      <svg fill="${this.color}" stroke="black" stroke-width="3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <circle cx="120" cy="120" opacity=".9" r="70" />
        <circle cx="120" cy="120" opacity=".6" r="90" />
        <circle cx="120" cy="120" opacity=".3" r="110" />
      </svg>`);

    return new google.maps.Marker({
      position: cluster.position,
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(45, 45),
      },
      label: {
        text: String(cluster.count),
        fontSize: '12px',
      },
      title: `Cluster of ${cluster.count} companies`,
    });
  }
}

@Component({
  selector: 'app-enterprises-global-map',
  templateUrl: './enterprises-global-map.component.html',
  styleUrls: ['./enterprises-global-map.component.scss']
})
export class EnterprisesGlobalMapComponent implements OnInit {
  private enterprises: Enterprise[] = [];
  categories: Category[] = [];
  selectedCategoryId: string;
  selectedCompany: Enterprise;
  selectedProject: KeyProject;

  options: string[] = [];

  private gasId: string;
  private adId: string;

  mediaAccepted = false;

  @ViewChild('mapContainer')
  private mapContainer: ElementRef;

  private map: google.maps.Map;
  private compMarkers: google.maps.Marker[] = [];
  private compCluster: MarkerClusterer;
  private compRenderer: SingleColorClusterRenderer;
  private projMarkers: google.maps.Marker[] = [];
  private projCluster: MarkerClusterer;
  private projRenderer: SingleColorClusterRenderer;

  @ViewChild('infoTemplate')
  private infoTemplate: ElementRef;
  private infoWindow: google.maps.InfoWindow;

  constructor(public service: EnterpriseService,
    private categoryService: CategoryService,
    public cookies: DiBiCooCookieService,
    private loader: Loader) { }

  ngOnInit() {
    if (this.cookies.checkMedia()) {
      this.mediaAccepted = true;

      forkJoin([
        from(this.loader.load()),
        this.service.getEnterprises(),
        this.categoryService.getRootCategories()
      ]).subscribe(([_, enterprises, categories]) => {
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 20, lng: 10 },
          zoom: 3,
          disableDefaultUI: true
        };
        this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
        this.compRenderer = new SingleColorClusterRenderer();
        this.compCluster = new MarkerClusterer({
          map: this.map,
          renderer: this.compRenderer
        });
        this.projRenderer = new SingleColorClusterRenderer('#f7544c');
        this.projCluster = new MarkerClusterer({
          map: this.map,
          renderer: this.projRenderer
        });

        this.infoWindow = new google.maps.InfoWindow({ content: this.infoTemplate.nativeElement });
        this.infoWindow.addListener('closeclick', () => {
          this.selectedCompany = null;
          this.selectedProject = null;
        });

        this.enterprises = enterprises.filter(e => e.displayOnGlobalMap && e.latlng && e.latlng[0] != null && e.latlng[1] != null);
        this.categories = categories;

        this.gasId = this.categories.find(c => c.isGAS)?.id;
        this.adId = this.categories.find(c => c.isAD)?.id;

        this.selectedCategoryId = this.adId;
        this.updateMarkers();
      });
    }
  }

  updateMarkers() {
    // clear existing
    this.compMarkers.forEach(m => m.setMap(null));
    this.compMarkers.length = 0;
    this.compCluster.clearMarkers();

    const icon = this.selectedCategoryId === this.gasId ? 'greenG' : 'blueA';
    const clusterColor = this.selectedCategoryId === this.gasId ? '#60b742' : '#2594f6';

    this.compMarkers = this.enterprises
      .filter(e => e.categoryIds.includes(this.selectedCategoryId))
      .map(e => {
        const marker = new google.maps.Marker(
          {
            position: {
              lat: e.latlng[0],
              lng: e.latlng[1]
            },
            map: this.map,
            icon: `assets/marker_${icon}.png`
          });

        marker.addListener('click', () => {
          this.selectedCompany = e;
          this.selectedProject = null;
          this.infoWindow.open({ map: this.map, anchor: marker });
        });
        return marker;
      }
      );

    this.compRenderer.color = clusterColor;
    this.compCluster.addMarkers(this.compMarkers);
    this.updateProjectsMarkers();
  }

  updateProjectsMarkers() {
    // clear existing
    this.projMarkers.forEach(m => m.setMap(null));
    this.projMarkers.length = 0;
    this.projCluster.clearMarkers();

    if (this.options.includes('keyProjects')) {
      this.enterprises
        .filter(e => e.categoryIds.includes(this.selectedCategoryId))
        .forEach(company => {
          (company.keyProjects || [])
            .filter(p => p.showOnMap && p.latlng && p.latlng[0] && p.latlng[1])
            .forEach(p => {
              const marker = new google.maps.Marker({
                position: {
                  lat: p.latlng[0],
                  lng: p.latlng[1]
                },
                map: this.map,
                icon: `assets/marker_red.png`
              });

              marker.addListener('click', () => {
                this.selectedCompany = null;
                this.selectedProject = p;
                this.selectedProject.company = company;
                this.infoWindow.open({ map: this.map, anchor: marker });
              });

              this.projMarkers.push(marker);
            });
        });

      this.projCluster.addMarkers(this.projMarkers);
    }
  }
}

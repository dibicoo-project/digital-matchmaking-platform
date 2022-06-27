import { Component, OnInit } from '@angular/core';

interface Feedback {
  avatarUrl?: string;
  name: string;
  title: string;
  text: string;
  loaded?: boolean;
}

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss']
})
export class FrontPageComponent implements OnInit {

  allFeedbacks: Feedback[] = [
    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Aleksejs.png',
      name: 'Aleksejs Zacepins',
      title: 'Latvia University of Life Sciences and Technologies',
      text: 'DiBiCoo’s matchmaking platform is open for any interested stakeholder within the biogas and gasification sectors. \
        The platform is constantly evolving and new features are implemented. The platform is open-source and can be also adapted \
        to other RES.',
    },
    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Bernhard.png',
      name: 'Bernhard Wlcek',
      title: 'Austrian Energy Agency',
      text: 'DiBiCoo’s new matchmaking platform connects project developers with companies offering the necessary expertise for \
        successful implementation. This decreases the development time on the one hand and opens up opportunities on the other.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Franz.png',
      name: 'Franz Kirchmeyr',
      title: 'Austrian Compost & Biogas Association',
      text: 'With the matchmaking platform biogas & gasification stakeholders receive an excellent tool bringing together technology \
        providers, investors and all other related branches of biogas and gasification industry. Stakeholders from the whole value \
        chain get the opportunity to quickly find what they are searching for.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Mieke.png',
      name: 'Mieke Decorte',
      title: 'European Biogas Association',
      text: 'The Matchmaking platform developed within the DiBiCoo project will facilitate the interaction between biogas technology \
        providers and project developers seeking to implement biogas production. Time efforts will be reduced both for technology \
        providers to investigate new markets and for biogas project developers finding the most suitable companies to collaborate \
        with for the execution of their project. We encourage all to register into the biogas platform and to profit from the benefits \
        this network brings along.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Frank.png',
      name: 'Frank Hofmann',
      title: 'German Biogas Association',
      text: 'The German Biogas Association is expecting that the biogas platform helps to bring biogas stakeholders worldwide together. \
        It allows interested persons to identify qualified biogas technology providers and contact them. Additionally the platform will \
        help to bring individuals together, some knowing about interesting locations with high biogas potential and others that offer \
        best solutions for that location.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Ann.png',
      name: 'Ann-Kathrin van Laere',
      title: 'GIZ, Germany',
      text: 'The Biogas and Gasification Matchmaking Platform is ideal as a starting point for business collaboration in the biogas \
        sector.  It facilitates the identification of suitable business partners for the realization of biogas projects and fosters \
        digital networking globally, which is now more important than ever.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Johannes.png',
      name: 'Johannes Anhorn',
      title: 'GIZ, Germany',
      text: 'The global pandemic has shown us, that we need coordinated efforts to collaborate globally on pressing issues: The B2B \
        matchmaking platform bridges between emerging markets in Africa, Asia, Latin America and Europe. New Biogas & Gasification \
        opportunities exist!',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Yaseen.png',
      name: 'Yaseen Salie',
      title: 'GreenCape, South Africa',
      text: 'DiBiCoo’s new matchmaking platform will provide stakeholders, from both exporting and importing countries of biogas \
        technologies, a means to reduce their expenses and capacity resource requirements when seeking new partnerships and \
        collaborations.',
    },
    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Jorge.png',
      name: 'Jorge A. Hilbert',
      title: 'Instituto Nacional de Tecnología Agropecuaria INTA EEC, Argentina',
      text: 'DiBiCoo’s new matchmaking platform is an excellent way to reduce distances between technology providers and users. \
        It is also a new possibility for companies in different countries to promote their products and know-how enhancing \
        collaboration south.',
    },

    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Elisabeth.png',
      name: 'Elisabeth Rianawati',
      title: 'Resilience Development Initiative, Indonesia',
      text: 'Indonesian Stakeholders are excited for the DiBiCoo’s new matchmaking platform. We realize that there are a lot to be \
        learnt, so we embrace the opportunity for any knowledge transfer that is provided by the DiBiCoo platform.',
    },
    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Dwight.png',
      name: 'Dwight Rosslee',
      title: 'Selectra CC, South Africa',
      text: 'I believe that the DiBiCoo Biogas and Gasification Platform is the best resource for market entrants, systems providers \
        and project developers to connect with leading industry specialists. Where else can you find company profiles, business \
        opportunities and factsheets all on one site? The matchmaking section will help you find your next business partner by using \
        filters to fine-tune your company search. In addition, this feature allows you to save your search criteria and receive \
        updates if new companies match your needs.',
    },
    {
      loaded: false,
      avatarUrl: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/testimonials/Dominik.png',
      name: 'Dominik Rutz',
      title: 'WIP Renewable Energies, Germany',
      text: 'The digital Matchmaking platform of the DiBiCoo projects is an excellent tool to facilitate worldwide networking between \
        biogas technology providers, project developers and investors. It will serve to promote biogas technologies at the global scale \
        in order to facilitate the energy transition and to mitigate climate change.',
    },
  ];

  feedbacks: Feedback[] = [];


  constructor() {
  }

  ngOnInit(): void {
    this.allFeedbacks.sort(() => Math.random() - 0.5);
    this.feedbacks = this.allFeedbacks.slice(0, 3);
  }

}

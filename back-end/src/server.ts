import 'reflect-metadata';

import { Container } from 'inversify';
import { getRouteInfo, InversifyExpressServer } from 'inversify-express-utils';

import { middlewareConfig, errorHandlingConfig } from './middleware';
import { bindServices } from './services';
// loading conroller metadata by just importing classes
import './controllers';

import { DiBiCooAuthProvider } from './security/auth-provider';

export function configureContainer() {
  const container = new Container({ autoBindInjectable: true });
  bindServices(container);
  return container;
}

export function configureServer(container: Container) {
  return new InversifyExpressServer(container, null, { rootPath: '/api/' }, null, DiBiCooAuthProvider)
    .setConfig(middlewareConfig)
    .setErrorConfig(errorHandlingConfig);
}

export function printEndpoitns(container: Container) {
  console.log('Defined endpoints:');
  getRouteInfo(container).forEach((item) => {
    console.log('\t', item.controller);
    item.endpoints.forEach((endpoint) => {
      console.log('\t\t', endpoint.route);
    });
  });

}

export function buildDiBiCooApp() {
  console.log('Starting DiBiCoo back-end');
  const container = configureContainer();
  const app = configureServer(container).build();
  printEndpoitns(container);
  return app;
}

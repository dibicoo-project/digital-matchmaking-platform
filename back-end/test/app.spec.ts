import express from 'express';
import { configureServer } from '../src/server';
import { Container } from 'inversify';
import { DefaultController } from '../src/utils/default.controller';
import { TYPE, cleanUpMetadata } from 'inversify-express-utils';
import supertest from 'supertest';
import { AUTH_CHECK } from '../src/security/jwtUtils';

describe('Integration: DiBiCoo default controller', () => {
  let app: express.Application;

  beforeEach((done) => {
    cleanUpMetadata();
    process.env.NODE_ENV = 'test';

    // start "real" application
    const container = new Container();
    container.bind(AUTH_CHECK).toConstantValue(
      (_1: any, _2: any, next: () => void) => {
        next(); // pass any request
      }
    );
    container.bind<DefaultController>(TYPE.Controller).to(DefaultController);
    app = configureServer(container).build();
    done();
  });

  it('should return API name and status', (done) => {
    supertest(app)
      .get('/api/')
      .expect(200)
      .end((err, res: any) => {
        expect(res.body.name).toBe('DiBiCoo API server');
        expect(res.body.status).toBe('OK');
        expect(res.body.uptime).toBeGreaterThan(0);
        done();
      });
  });
});

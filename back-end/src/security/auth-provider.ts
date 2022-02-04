import express from 'express';
import { injectable, inject } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { DiBiCooPrincipal } from './principal';
import { AUTH_CHECK } from './jwtUtils';

@injectable()
export class DiBiCooAuthProvider implements interfaces.AuthProvider {

  @inject(AUTH_CHECK) public check: express.RequestHandler;

  public getUser(req: express.Request, res: express.Response, next: express.NextFunction) {

    return new Promise<DiBiCooPrincipal>((resolve) => {
      // calling exress-jwt middleware explicitly,
      // as AuthProvider is injected into very first middleware during server.build()
      // and no other middleware is run before it
      this.check(req, res, (err) => {
        if (err) {
          next(err);
        } else {
          const usr = (req as any).user;
          resolve(new DiBiCooPrincipal(usr));
        }
      });
    });
  }
}

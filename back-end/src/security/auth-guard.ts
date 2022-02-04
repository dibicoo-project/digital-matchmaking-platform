import { DiBiCooPrincipal } from './principal';
import express from 'express';
import { unauthorized, forbidden } from '../utils/common-responses';

/**
 * Static wrapper for using in contoller annotations. Intentionally mimics DiBiCooPrincipal functions
 */
export class AuthGuard {

  public static or(...checks: express.RequestHandler[]): express.RequestHandler {
    return async (req, res, next) => {
      const promises = checks.map((handler) => {
        return new Promise((resolve) => {
          handler(req, res, (err) => {
            resolve(err);
          });
        });
      });
      const results = await Promise.all(promises);
      if (results.includes(null)) {
        next(null);
      } else {
        const error = results.find((item) => item !== null);
        next(error);
      }
    };
  }

  public static isAuthenticated() {
    return this.handler((user) => user.isAuthenticated(), unauthorized);
  }

  public static isInRole(role: string) {
    return this.handler((user) => user.isInRole(role), forbidden);
  }

  private static handler(check: (user: DiBiCooPrincipal) => Promise<boolean>, error: any): express.RequestHandler {
    return async (req, _, next) => {
      const ok = await check(this.principal(req));
      next(!ok ? error : null);
    };
  }

  private static principal(req: any) {
    return new DiBiCooPrincipal(req.user);
  }
}

import express from 'express';
import { forbidden } from '../utils/common-responses';

/**
 * Static guard for cron tasks
 */
export class CronGuard {

  public static isAppEngine() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.header('X-Appengine-Cron')) {
        next(null);
      } else {
        next(forbidden);
      }
    };
  }
}

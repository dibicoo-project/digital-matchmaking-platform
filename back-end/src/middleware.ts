import express from 'express';
import morgan from 'morgan';
import * as mung from 'express-mung';

import { transformId } from './utils/transform-datastore-id';
import { asObject } from './utils/asObject';
import { badRequest } from './utils/common-responses';

export const middlewareConfig = (app: express.Application) => {
  app.use(express.json());
  app.use(mung.json(transformId));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev')); // TODO: define custom log format
  }
};

export const errorHandlingConfig = (app: express.Application) => {
  app.use((req, res, _) => {
    res.status(404).json({ name: 'NotFound', message: 'Not found', path: req.path });
  });

  app.use((err: any, req: any, res: any, _: any) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ ...badRequest, message: err.message });
    } else {
      // asObject "hack" is needed because pure Error objects don't have enumerable properties
      res.status(err.status || 500).json({ ...asObject(err), path: req.path, stack: undefined });
      if (res.statusCode === 500) {
        console.error(err);
      }
    }
  });
};

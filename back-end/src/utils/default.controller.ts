import { controller, httpGet } from 'inversify-express-utils';

@controller('/')
export class DefaultController {

  @httpGet('')
  public getStatus() {
    return {
      name: 'DiBiCoo API server',
      status: 'OK',
      uptime: process.uptime(),
      version: process.env.GAE_VERSION || 'local'
    };
  }
}

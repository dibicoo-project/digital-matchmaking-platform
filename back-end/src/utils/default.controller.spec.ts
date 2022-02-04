import { DefaultController } from './default.controller';

describe('DefaultController', () => {
  let controller: DefaultController;
  beforeEach(() => {
    controller = new DefaultController();
  });

  it('should return API status', () => {
    const status = controller.getStatus();
    expect(status.name).toContain('DiBiCoo');
    expect(status.status).toBe('OK');
  });
});

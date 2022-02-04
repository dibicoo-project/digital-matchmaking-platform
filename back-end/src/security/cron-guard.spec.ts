import { CronGuard } from "./cron-guard";

describe('CronGuard', () => {
  const next = jasmine.createSpy('nextSpy');
  const handler = CronGuard.isAppEngine()

  beforeEach(() => {
    next.calls.reset();
  });

  afterEach(() => {
    expect(next).toHaveBeenCalledTimes(1);
  });


  it('should pass app engine request', async () => {
    const req = {
      header: jasmine.createSpy().and.returnValue('true')
    } as any;

    await handler(req, null as any, next);
    expect(next).toHaveBeenCalledWith(null);
    expect(req.header).toHaveBeenCalledWith('X-Appengine-Cron')
  });

  it('should deny other requests', async () => {
    const req: any = {
      header: () => null
    };

    await handler(req, null as any, next);
    expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Forbidden', status: 403 }));
  });

});

import { createMock } from './../../test/utils';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';

describe('AttachmentController', () => {
  let controller: AttachmentController;
  let service: AttachmentService;

  beforeEach(() => {
    service = createMock(AttachmentService);
    controller = new AttachmentController(service);
  });

  it('should upload attachment', async () => {
    spyOn(service, 'uploadAttachment').and.returnValue(Promise.resolve({} as any));
    await controller.uploadAttachment({ file: {} } as any, {} as any);
    expect(service.uploadAttachment).toHaveBeenCalled();
  });
});

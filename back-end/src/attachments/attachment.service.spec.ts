import { createMock } from './../../test/utils';
import { DiBiCooPrincipal } from '../security/principal';
import { StorageService } from '../common/storage.service';
import { AttachmentService } from './attachment.service';

describe('AttachmentService', () => {

  let storage: StorageService;
  let service: AttachmentService;

  beforeEach(() => {
    storage = createMock(StorageService);
    service = new AttachmentService(storage);
  });

  it('should upload attachmenet', async () => {
    spyOn(storage, 'uploadAttachment').and.returnValue(Promise.resolve({ id: 'uuid' } as any));

    await service.uploadAttachment(
      {
        originalname: 'test.jpg',
        buffer: Buffer.from([0xff, 0xd8, 0xff]) // JPEG magic numbers
      } as any,
      {} as any
    );

    expect(storage.uploadAttachment).toHaveBeenCalledWith('test.jpg', 'image/jpeg', jasmine.anything());
  });

  it('should reject unsupported file type', async () => {  
    await service.uploadAttachment(
      {
        buffer: Buffer.from([1, 2, 3])
      } as any,
      {} as any
    ).catch(v => {
      expect(v.status).toEqual(400);
    });
  });

  it('should reject wrong extentions', async () => {
    await service.uploadAttachment(
      {
        originalname: 'test.docx',
        buffer: Buffer.from([0xff, 0xd8, 0xff]) // JPEG magic numbers
      } as any,
      {} as any
    ).catch(v => {
      expect(v.status).toEqual(400);
    });;
  });
});

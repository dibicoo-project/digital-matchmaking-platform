import { createMock } from '../../test/utils';
import { Storage } from '@google-cloud/storage';
import { StorageService } from './storage.service';
import { ImageService } from './image.service';

describe('StorageService', () => {
  let storage: Storage;
  let service: StorageService;
  let imageService: ImageService;

  beforeEach(() => {
    storage = createMock(Storage);
    imageService = createMock(ImageService);
    service = new StorageService(storage, imageService);
  });

  describe('internal', () => {
    let fileSpy: jasmine.Spy;

    beforeEach(() => {
      fileSpy = jasmine.createSpy('file spy');
      service['bucket'] = {
        file: fileSpy,
      } as any;
    });

    it('should upload file', async () => {
      const stream = {
        on: (event: string, cb: () => void) => event === 'finish' && Promise.resolve(cb()),
        end: (buf: any) => expect(buf).toBe('binary buffer')
      };
      const blob = {
        createWriteStream: () => stream,
        getMetadata: () => [{ meta: 'data' }, null]
      };

      fileSpy.and.returnValue(blob);

      const res = await service['uploadFile']('dir', 'file-name', 'mime-type', 'binary buffer');

      expect(fileSpy).toHaveBeenCalledWith(`dir/file-name`);
      expect(res).toEqual({ meta: 'data' });
    });

    it('should handle file upload error', async () => {
      const stream = {
        on: (event: string, cb: (v: any) => void) => event === 'error' && Promise.resolve(cb({})),
        end: (buf: any) => expect(buf).toBe('binary buffer')
      };
      const blob = {
        createWriteStream: () => stream,
        getMetadata: () => [{ meta: 'data' }, null]
      };

      fileSpy.and.returnValue(blob);

      await service['uploadFile']('dir', 'file-name', 'mime-type', 'binary buffer')
        .catch((err: any) => expect(err.message).toBe(`File upload failed: dir/file-name`));

      expect(fileSpy).toHaveBeenCalledWith(`dir/file-name`);
    });

    it('should delete file', async () => {
      const blob = {
        delete: jasmine.createSpy()
      };
      fileSpy.and.returnValue(blob);

      await service['deleteFile']('dir', 'file-name');

      expect(fileSpy).toHaveBeenCalledWith(`dir/file-name`);
      expect(blob.delete).toHaveBeenCalled();
    });

  });

  describe('wrappers', () => {

    beforeEach(() => {
      spyOn(service as any, 'uploadFile');
      spyOn(service as any, 'deleteFile');
      service['bucket'] = { name: 'bucket' } as any;
      spyOn(imageService, 'resizeToPng').and.returnValue('png buffer' as any);
    });

    it('should upload logo', async () => {
      const id = await service.uploadLogo('binary buffer');

      expect(imageService.resizeToPng).toHaveBeenCalled();
      expect(service['uploadFile']).toHaveBeenCalledWith('logos', id, 'image/png', 'png buffer');
    });

    it('should delete logo', async () => {
      await service.deleteLogo('logo-name');

      expect(service['deleteFile']).toHaveBeenCalledWith('logos', 'logo-name');
    });

    it('should return logo url', () => {
      const res = service.getLogoUrl('file-name');

      expect(res).toMatch(`^https://storage.+/logos/file-name$`);
    });

    it('should upload category image', async () => {
      await service.uploadCategoryImage('category-name', 'binary buffer');

      expect(imageService.resizeToPng).toHaveBeenCalled();
      expect(service['uploadFile']).toHaveBeenCalledWith('categoryImages', 'category-name', 'image/png', 'png buffer');
    });

    it('should delete category image', async () => {
      await service.deleteCategoryImage('category-name');

      expect(service['deleteFile']).toHaveBeenCalledWith('categoryImages', 'category-name');
    });

    it('should return category image url', () => {
      const res = service.getCategoryImageUrl('file-name');
      expect(res).toMatch(`^https://storage.+/categoryImages/file-name$`);
    });
  });

  it('should upload attachement', async () => {
    const spy = jasmine.createSpy('file-spy')
    service['bucket'] = { file: () => ({ save: spy}) } as any;
    const res = await service.uploadAttachment('test-name', 'mime/test', 'binary buffer' as any);

    expect(spy).toHaveBeenCalledWith('binary buffer', jasmine.anything());
    expect(res.length).toBe(36);
  });

});

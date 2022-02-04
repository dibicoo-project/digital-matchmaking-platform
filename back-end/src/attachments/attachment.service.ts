import { injectable } from 'inversify';
import { DiBiCooPrincipal } from '../security/principal';
import { StorageService } from '../common/storage.service';

import * as FileType from 'file-type';
import { badRequestFn } from '../utils/common-responses';

@injectable()
export class AttachmentService {

  private allowedMimeTypes = [
    // images
    'image/jpeg',
    'image/png',
    // documents
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    // spreadsheets
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    // other
    'application/pdf'
  ];

  constructor(private storage: StorageService) { }

  public async uploadAttachment(file: Express.Multer.File, _: DiBiCooPrincipal) {
    const type = await FileType.fromBuffer(file.buffer);

    if (!type || !this.allowedMimeTypes.includes(type.mime)) {
      return Promise.reject(badRequestFn(`File mime type is not supported ${type?.mime || ''}`));
    } else if (!file.originalname.endsWith(type.ext)) {
      return Promise.reject(badRequestFn(`File mime type and extension does not match (expected *.${type.ext})`));
    }

    const id = await this.storage.uploadAttachment(file.originalname, type.mime, file.buffer);
    return { id };
  }
}

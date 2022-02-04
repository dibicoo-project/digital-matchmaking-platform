import { injectable } from 'inversify';
import { Storage } from '@google-cloud/storage';

import { v4 as uuid } from 'uuid';
import { ImageService } from './image.service';

const DIRS = {
  logos: 'logos',
  category: 'categoryImages',
  attachments: 'attachments'
};

@injectable()
export class StorageService {

  constructor(private storage: Storage, private imageService: ImageService) { }

  private bucket = this.storage.bucket(process.env.GCLOUD_STORAGE_BUCKET!);

  private async uploadFile(dir: string, name: string, mimetype: string, buffer: any) {
    const blob = this.bucket.file(`${dir}/${name}`);
    const writeStream = blob.createWriteStream({
      resumable: false,
      predefinedAcl: 'publicRead',
      contentType: mimetype,
    });

    const uploadImg = () => new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      writeStream.end(buffer);
    });

    await uploadImg().catch(err => {
      throw { details: err.errors, message: `File upload failed: ${dir}/${name}` };
    });

    const [metadata] = await blob.getMetadata();
    return metadata;
  }

  private async deleteFile(dir: string, name: string) {
    await this.bucket.file(`${dir}/${name}`).delete();
  }

  private getFileUrl(dir: string, name: string): string {
    return `https://storage.googleapis.com/${this.bucket.name}/${dir}/${name}`;
  }

  public async uploadLogo(buffer: any) {
    const id = uuid();
    const png = await this.imageService.resizeToPng(buffer, 300, 300);    
    await this.uploadFile(DIRS.logos, id, 'image/png', png);
    return id;
  }

  public async deleteLogo(id: string) {
    await this.deleteFile(DIRS.logos, id);
  }

  public getLogoUrl(id: string): string {
    return this.getFileUrl(DIRS.logos, id);
  }

  public async uploadCategoryImage(name: string, buffer: any) {
    const png = await this.imageService.resizeToPng(buffer, 266, 133);
    return this.uploadFile(DIRS.category, name, 'image/png', png);
  }
  public async deleteCategoryImage(name: string) {
    await this.deleteFile(DIRS.category, name);
  }
  public getCategoryImageUrl(name: string): string {
    return this.getFileUrl(DIRS.category, name);
  }

  public async uploadAttachment(fileName: string, mimetype: string, buffer: Buffer) {
    const id = uuid();

    const blob = this.bucket.file(`${DIRS.attachments}/${id}`);
    await blob.save(buffer, {
      resumable: false,
      predefinedAcl: 'publicRead',
      contentType: mimetype,
      metadata: {
        contentDisposition: `inline; filename="${fileName}"`
      }
    });
    return id;
  }
}

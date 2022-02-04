import { injectable } from 'inversify';
import sharp from 'sharp';

@injectable()
export class ImageService {

  public async resizeToPng(buffer: Buffer, sizeW: number, sizeH: number) {
    return await sharp(buffer)
      .resize(sizeW, sizeH, { fit: 'inside' })
      .png()
      .toBuffer();
  }

}

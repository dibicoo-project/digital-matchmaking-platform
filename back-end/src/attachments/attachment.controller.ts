import express from 'express';

import { controller, httpPost, request, principal } from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { multerFile } from '../utils/multer';
import { AttachmentService } from './attachment.service';

@controller('/user/attachments', AuthGuard.isAuthenticated())
export class AttachmentController {

  constructor(private service: AttachmentService) { }

  @httpPost('', multerFile('file'))
  public async uploadAttachment(@request() req: express.Request,
                                @principal() user: DiBiCooPrincipal) {
    return await this.service.uploadAttachment(req.file, user);
  }
}

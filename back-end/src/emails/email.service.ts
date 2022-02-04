import { inject, injectable } from "inversify";
import { EnvKey, EnvService } from "../common/environment.service";


@injectable()
export class EmailService {

  constructor(private env: EnvService, @inject('mailjet') private mailjet: any) { }

  public async sendMany(list: { id: string; email: string, count: number }[]): Promise<string[]> {
    if (!list.length) {
      return [];
    }

    const config = await this.env.get(EnvKey.MailJet);

    const messages = list.map(one => (
      {
        "From": {
          "Email": "no-reply@biogasplatform.eu",
          "Name": "Biogas and Gasification Matchmaking Platform"
        },
        "To": [
          {
            "Email": one.email
          }
        ],
        "Subject": "Biogas and Gasification Matchmaking Platform | Weekly digest",
        "TemplateID": config.template,
        "TemplateLanguage": true,
        "CustomID": one.id,
        "Variables": {
          "count": one.count
        }
      }
    ));

    const client = this.mailjet.connect(config.apiKey, config.secret);        
    const result = await client
      .post("send", { 'version': 'v3.1' })
      .request({ "Messages": messages });

    const success = ((result.body as any)["Messages"] as any[])
      .filter(one => one["Status"] === 'success')
      .map(one => one["CustomID"]);

    return success;
  }
}
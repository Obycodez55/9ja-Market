import { google } from "googleapis";
import { createTransport, Transporter } from "nodemailer";
import * as ejs from "ejs";
import path from "path";
import { IEmailService } from "../email.service.interface";
import { ILogger } from "../../logger/logger.interface";
import { configService } from "../../config/config.service";
import SMTPPool from "nodemailer/lib/smtp-pool";
import { EmailPaths, EmailSubjects } from "../../../constants/email.enum";

class OAuth2Client extends google.auth.OAuth2 { }

export default class NodemailerProvider implements IEmailService {
    private readonly OAuth2Client: OAuth2Client;
    private readonly transporter: Transporter;
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.OAuth2Client = new google.auth.OAuth2(
            configService.get<string>("GMAIL_CLIENT_ID"),
            configService.get<string>("GMAIL_CLIENT_SECRET"),
            "https://developers.google.com/oauthplayground" // or your redirect URI
          );
          this.OAuth2Client.setCredentials({
            refresh_token: configService.get<string>("GMAIL_REFRESH_TOKEN"),
          });
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
            type: 'OAuth2',
            user: configService.get<string>("COMPANY_EMAIL"),
            clientId: configService.get<string>("GMAIL_CLIENT_ID"),
            clientSecret: configService.get<string>("GMAIL_CLIENT_SECRET"),
            refreshToken: configService.get<string>("GMAIL_REFRESH_TOKEN"),
            },
        } as unknown as SMTPPool);
    }

    public sendMail({ to, subject, options }: { to: string; subject: EmailSubjects; options: { template: EmailPaths; data: { [key: string]: any; }; }; }): Promise<boolean> {
        (this.transporter as any).accessToken = this.OAuth2Client.getAccessToken() as any;

        return new Promise<boolean>((resolve, reject) => {
            const template = path.resolve("view/emails", options.template);
            ejs.renderFile(template, options.data, (error, html) => {
                if (error) {
                    this.logger.error("Error rendering email template", error);
                    reject(error);
                    return;
                }
                this.transporter.sendMail({
                    from: configService.get<string>("COMPANY_EMAIL"),
                    to,
                    subject,
                    html
                }, (err, info) => {
                    if (err) {
                        this.logger.error("Error sending email", err);
                        reject(err);
                        return;
                    }
                    this.logger.info("Email sent successfully");
                    resolve(true);
                });
            });
        });
    }
}

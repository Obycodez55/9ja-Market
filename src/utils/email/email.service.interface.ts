import { EmailPaths, EmailSubjects } from "../../constants/email.enum";

export interface IEmailService {
    sendMail(
        { to, subject, options }: {
            to: string;
            subject: EmailSubjects;
            options: {
                template: EmailPaths;
                data: { [key: string]: any; };
            };
        }
    )
        : Promise<boolean>;
}
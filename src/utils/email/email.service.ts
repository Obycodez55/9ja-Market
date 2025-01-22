import path from 'path';
import { EmailPaths, EmailSubjects } from '../../constants/email.enum';
import { WinstonLogger } from '../logger/winston.logger';
import { IEmailService } from './email.service.interface';
import { readdirSync } from 'fs';

export class EmailService implements IEmailService {
    private readonly logger: WinstonLogger;
    private providers: IEmailService[] = [];
    constructor() {
        this.logger = new WinstonLogger("EmailService");
        this.loadProviders();
    }

    private async loadProviders(): Promise<void> {
        // Load all providers
        const providerPath = path.join(__dirname, 'providers');
        const providerFiles = readdirSync(providerPath);
        // Iterate over all files in the providers directory
        for (const file of providerFiles) {
            if (file.endsWith('.provider.ts') || file.endsWith('.provider.js')) {
                const provider = await import(path.join(providerPath, file));
                if (provider.default) {
                    this.providers.push(new provider.default(this.logger));
                }
            }
        }
    }

    async sendMail({ to, subject, options }: { to: string; subject: EmailSubjects; options: { template: EmailPaths; data: { [key: string]: any; }; }; }): Promise<boolean> {
        for (const provider of this.providers) {
            try {
                await provider.sendMail({ to, subject, options });
                return true; // Success, return immediately
            } catch (error) {
                this.logger.error(`Error sending email to ${to} with ${provider.constructor.name}`, error);
            }
        }
        // If no provider succeeded
        this.logger.error(`All providers failed to send email to ${to} with subject ${subject}`);
        return false; // Failure
    }
}
import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService, private mailerService: MailerService) {}

    @Get()
    @Public()
    @ResponseMessage('Test email')
    async handleTestEmail() {
        await this.mailerService.sendMail({
            to: 'phananhloc03102001@gmail.com',
            from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'job',
        });
    }
}

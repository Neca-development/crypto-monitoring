import { Controller, Get, Post } from '@nestjs/common'
import { EmailService } from './email.service'

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test')
  testEmail() {
    this.emailService.sendTestMail()
  }
}

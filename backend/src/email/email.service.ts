import { Injectable } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import Config from 'config'

@Injectable()
export class EmailService {
  private nodemailerTransport

  constructor() {
    const email: any = Config.get('email')
    console.log(email)

    if (email.service && email.user && email.password) {
      this.nodemailerTransport = createTransport({
        service: email.service,
        auth: {
          user: email.user,
          pass: email.password
        }
      })

      console.log(`Email config initialized`)
    }
  }

  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options)
  }

  sendTestMail() {
    this.sendMail({
      to: 'QVing612@gmail.com',
      subject: 'test',
      text: 'Test mail'
    })
  }
}

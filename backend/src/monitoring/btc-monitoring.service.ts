import { Injectable, Logger } from '@nestjs/common'
import * as WebSocket from 'ws'
import { EmailService } from '../email/email.service'

// 'wss://ws.smartbit.com.au/v1/blockchain?type=new-transaction'
// wss://socket.blockcypher.com/v1/btc/main?token=

@Injectable()
export class BtcMonitoringService {
  private readonly logger = new Logger(BtcMonitoringService.name)
  private readonly cypherToken = '680e4ba6704d47978da3f0f3d9c91dd0'

  constructor(private emailService: EmailService) {}
  onModuleInit() {
    this.logger.log(`Btc Monitoring Service initalzied`)
    let ws = new WebSocket.default(
      `wss://socket.blockcypher.com/v1/btc/main?token=${this.cypherToken}`
    )

    ws.onmessage = event => {
      console.log(event.data)
    }

    ws.onopen = event => {
      console.log(`Connection openned`)
      ws.send(JSON.stringify({ event: 'confirmed-tx' }))
    }

    let wsCustom = new WebSocket.default('wss://ws.blockchain.info/inv')

    wsCustom.onopen = event => {
      wsCustom.send(
        JSON.stringify({
          op: 'addr_sub',
          addr: '18cBEMRxXHqzWWCxZNtU91F5sbUNKhL5PX'
        })
      )

      wsCustom.send(
        JSON.stringify({
          op: 'addr_sub',
          addr: '1E6vTBe9KLCh5ZqEkLoV2Fh5syXVHxHkna'
        })
      )

      wsCustom.send(
        JSON.stringify({
          op: 'addr_sub',
          addr: '1E6vTBe9KLCh5ZqEkLoV2Fh5syXVHxHkna'
        })
      )
    }

    wsCustom.onmessage = event => {
      console.log(event.data)
      this.emailService.sendMail({
        to: 'QVing612@gmail.com',
        subject: 'New transaction',
        text: `${event.data}`
      })
    }
  }
}

import { HttpService, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class VaultConvertationService {

    logger = new Logger(VaultConvertationService.name)

    constructor(private httpService: HttpService) { }

    async btcToEur(value: number): Promise<number> {
        let result = await this.httpService
            .get(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR'
            )
            .toPromise()

        let currency = result.data.bitcoin.eur
        return value * currency
    }


    async ethToEur(value: number): Promise<number> {
        let result = await this.httpService
            .get(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=EUR'
            )
            .toPromise()

        let currency = result.data.ethereum.eur
        return value * currency
    }

    /*
        Конвертация балансов erc20 токенов в евро
        Если контракт не поддерживается api coingeeko - возвращает 0
    */

    async erc20toEur(value: number, contractAddress: string) {
        let result = await this.httpService
            .get(
                `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=eur`
            )
            .toPromise()

        if (!result.data[contractAddress]) {
            this.logger.error(`Coingecko cannot get currency for contract address: ${contractAddress}`)
            return 0
        }

        let currency = result.data[contractAddress].eur
        return value * currency
    }
}
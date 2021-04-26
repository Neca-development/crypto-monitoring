import { Test, TestingModule } from '@nestjs/testing';
import { BtcMonitoringService } from './btc-monitoring.service';

describe('BtcMonitoringService', () => {
  let service: BtcMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BtcMonitoringService],
    }).compile();

    service = module.get<BtcMonitoringService>(BtcMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

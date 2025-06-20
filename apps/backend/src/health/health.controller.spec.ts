import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import {
  HealthController,
  DatabaseHealthIndicator,
  QueueHealthIndicator,
} from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: {},
              error: {},
              details: {},
            }),
          },
        },
        {
          provide: DatabaseHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              database: {
                status: 'up',
                message: 'PostgreSQL connection is healthy',
              },
            }),
          },
        },
        {
          provide: QueueHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              queue: { status: 'up', message: 'Queue system is healthy' },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const result = await controller.check();
      expect(result).toEqual({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('detailedCheck', () => {
    it('should return detailed health check result', async () => {
      const result = await controller.detailedCheck();
      expect(result).toEqual({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('ping', () => {
    it('should return ping response', () => {
      const result = controller.ping();
      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AssemblyaiService } from './assemblyai.service';

describe('AssemblyaiService', () => {
  let service: AssemblyaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssemblyaiService],
    }).compile();

    service = module.get<AssemblyaiService>(AssemblyaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

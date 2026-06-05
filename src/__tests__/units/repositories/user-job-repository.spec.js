import { jest } from '@jest/globals';
import Chance from 'chance';
import factory from '../factory/user-job-model-factory.js';

const chance = new Chance();

const prismaMock = {
  userJob: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../common/prisma/prisma.js', () => prismaMock);

const repository = (await import('../../../repositories/User_JobRepository.js')).default;

describe('User Job Context', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user_job object and return it', async () => {
    const mock = factory.createUser_JobModelMock(factory.USER_JOB);
    prismaMock.userJob.create.mockResolvedValueOnce(mock);
    const result = await repository.createUser_Job(mock.userId, mock.jobId, mock.created);
    expect(result).toBeDefined();
  });

  it('should throw when user_job creation fails', async () => {
    prismaMock.userJob.create.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.createUser_Job(1, 1, false)).rejects.toThrow();
  });

  it('should return a list of user_jobs with job included and count', async () => {
    const max = chance.integer({ min: 1, max: 10 });
    const mocks = Array.from({ length: max }, () =>
      factory.createUser_JobModelMock(factory.USER_JOB_INCLUDE_JOB)
    );
    prismaMock.$transaction.mockResolvedValueOnce([mocks, max]);
    const userId = chance.integer({ min: 1 });
    const result = await repository.getJobsByUserId(userId, false);
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(max);
    expect(result.count).toBe(max);
  });

  it('should find job information by jobId', async () => {
    const mock = factory.createUser_JobModelMock(factory.USER_JOB_INCLUDE_JOB_AND_USER);
    prismaMock.userJob.findFirst.mockResolvedValueOnce(mock);
    const result = await repository.getInformationByJobId(mock.jobId);
    expect(result).toBeDefined();
  });

  it('should return null when jobId not found', async () => {
    prismaMock.userJob.findFirst.mockResolvedValueOnce(null);
    const result = await repository.getInformationByJobId(999);
    expect(result).toBeNull();
  });

  it('should count user_job by jobId and userId and return 1', async () => {
    const mock = factory.createUser_JobModelMock(factory.USER_JOB);
    prismaMock.userJob.count.mockResolvedValueOnce(1);
    const count = await repository.countUser_JobByJobIdAndUserId(mock.jobId, mock.userId);
    expect(count).toBe(1);
  });

  it('should count user_job by jobId and userId and return 0', async () => {
    const mock = factory.createUser_JobModelMock(factory.USER_JOB);
    prismaMock.userJob.count.mockResolvedValueOnce(0);
    const count = await repository.countUser_JobByJobIdAndUserId(mock.jobId, mock.userId);
    expect(count).toBe(0);
  });
});

import { jest } from '@jest/globals';
import { jobModelMock } from '../factory/job-model-factory';

const prismaMock = {
  job: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  userJob: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../common/prisma/prisma.js', () => prismaMock);

const repository = (await import('../../../repositories/JobRepository.js')).default;

describe('Jobs Context', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getJobById: should find a job by id', async () => {
    prismaMock.job.findUnique.mockResolvedValueOnce(jobModelMock);
    const result = await repository.getJobById(jobModelMock.id);
    expect(result).toBeDefined();
  });

  it('getJobById: should return null when not found', async () => {
    prismaMock.job.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getJobById(999);
    expect(result).toBeNull();
  });

  it('createJob: should create job and return it', async () => {
    prismaMock.job.create.mockResolvedValueOnce(jobModelMock);
    prismaMock.userJob.create.mockResolvedValueOnce({ userId: 1, jobId: jobModelMock.id, created: true });
    const body = {
      title: jobModelMock.title,
      description: jobModelMock.description,
      site: jobModelMock.site,
      type: jobModelMock.type,
      workload: jobModelMock.workload,
      salary: jobModelMock.salary,
      endingDate: jobModelMock.endingDate,
      startingDate: jobModelMock.startingDate,
      scholarity: jobModelMock.scholarity,
    };
    const result = await repository.createJob(body, 1);
    expect(result).toBeDefined();
  });

  it('createJob: should throw on error', async () => {
    prismaMock.job.create.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.createJob({}, 1)).rejects.toThrow();
  });

  it('updateJob: should update job and return it', async () => {
    prismaMock.job.update.mockResolvedValueOnce(jobModelMock);
    const result = await repository.updateJob({ title: 'new' }, jobModelMock.id);
    expect(result).toBeDefined();
  });

  it('updateJob: should throw on error', async () => {
    prismaMock.job.update.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.updateJob({}, 999)).rejects.toThrow('falha na operação.');
  });

  it('deleteJob: should delete job', async () => {
    prismaMock.job.delete.mockResolvedValueOnce(jobModelMock);
    await expect(repository.deleteJob(jobModelMock.id)).resolves.not.toThrow();
  });

  it('deleteJob: should throw on error', async () => {
    prismaMock.job.delete.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.deleteJob(999)).rejects.toThrow('falha na operação.');
  });

  it('applyToJob: should create user_job application', async () => {
    prismaMock.userJob.create.mockResolvedValueOnce({ userId: 1, jobId: jobModelMock.id, created: false });
    const result = await repository.applyToJob(1, jobModelMock.id);
    expect(result).toBeDefined();
  });

  it('getAllJobs: should return jobs list with count', async () => {
    prismaMock.$transaction.mockResolvedValueOnce([[jobModelMock], 1]);
    const result = await repository.getAllJobs(undefined, 10, 1);
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.count).toBe(1);
  });
});

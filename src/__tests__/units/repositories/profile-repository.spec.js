import { jest } from '@jest/globals';
import Chance from 'chance';
import factory from '../factory/profile-model-factory';

const chance = new Chance();

const prismaMock = {
  profile: {
    findUnique: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../common/prisma/prisma.js', () => prismaMock);

const repository = (await import('../../../repositories/ProfileRepository.js')).default;

describe('Profile Context', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find a profile by id', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.findUnique.mockResolvedValueOnce(mock);
    const result = await repository.getProfileById(mock.id);
    expect(result).toBeDefined();
  });

  it('should return null when profile not found by id', async () => {
    prismaMock.profile.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getProfileById(999);
    expect(result).toBe(null);
  });

  it('should find a profile by userId', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.findUnique.mockResolvedValueOnce(mock);
    const result = await repository.getProfileByUserId(mock.userId);
    expect(result).toBeDefined();
  });

  it('should return null when profile not found by userId', async () => {
    prismaMock.profile.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getProfileByUserId(999);
    expect(result).toBe(null);
  });

  it('should count profiles by userId and return 1', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.count.mockResolvedValueOnce(1);
    const count = await repository.countProfileByUserId(mock.userId);
    expect(count).toBe(1);
  });

  it('should count profiles by userId and return 0', async () => {
    prismaMock.profile.count.mockResolvedValueOnce(0);
    const count = await repository.countProfileByUserId(999);
    expect(count).toBe(0);
  });

  it('should return a list of profiles with count', async () => {
    const max = chance.integer({ min: 1, max: 10 });
    const profiles = Array.from({ length: max }, () => factory.createProfileModelMock(false));
    prismaMock.$transaction.mockResolvedValueOnce([profiles, max]);
    const itemsPerPage = chance.integer({ min: 1, max: 50 });
    const pageNumber = chance.integer({ min: 1, max: 10 });
    const result = await repository.getAllProfiles(undefined, itemsPerPage, pageNumber, undefined);
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(max);
    expect(result.count).toBe(max);
  });

  it('should update the profile with given id and return the updated object', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.update.mockResolvedValueOnce(mock);
    const body = {
      birthDate: mock.birthDate,
      knowledge: mock.knowledge,
      scholarity: mock.scholarity,
      technologies: mock.technologies,
      languages: mock.languages,
      linkResume: mock.linkResume,
      searchable: mock.searchable,
      userId: mock.userId,
    };
    const result = await repository.updateProfile(body, mock.id);
    expect(result).toBeDefined();
  });

  it('should throw when update fails', async () => {
    prismaMock.profile.update.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.updateProfile({}, 999)).rejects.toThrow('falha na operação.');
  });

  it('should create a profile and return the created object', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.create.mockResolvedValueOnce(mock);
    const body = {
      birthDate: mock.birthDate.toISOString().split('T')[0],
      knowledge: mock.knowledge,
      scholarity: mock.scholarity,
      technologies: mock.technologies,
      languages: mock.languages,
      linkResume: mock.linkResume,
      searchable: String(mock.searchable),
      userId: mock.userId,
    };
    const result = await repository.createProfile(body);
    expect(result).toBeDefined();
  });

  it('should delete the profile with given id and return the deleted object', async () => {
    const mock = factory.createProfileModelMock(true);
    prismaMock.profile.delete.mockResolvedValueOnce(mock);
    const result = await repository.deleteProfile(mock.id);
    expect(result).toBeDefined();
  });

  it('should throw when delete fails', async () => {
    prismaMock.profile.delete.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.deleteProfile(999)).rejects.toThrow('falha na operação.');
  });
});

import { jest } from '@jest/globals';
import { skillModelMock } from '../factory/skill-model-factory';

const prismaMock = {
  skill: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
};

jest.mock('../../../common/prisma/prisma.js', () => prismaMock);

const repository = (await import('../../../repositories/SkillRepository.js')).default;

describe('Skills Context', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getAllSkills: should find all skills', async () => {
    prismaMock.skill.findMany.mockResolvedValueOnce([skillModelMock]);
    const result = await repository.getAllSkills();
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it('getAllSkills: should return empty array', async () => {
    prismaMock.skill.findMany.mockResolvedValueOnce([]);
    const result = await repository.getAllSkills();
    expect(result).toHaveLength(0);
  });

  it('getSkillById: should find a skill by id', async () => {
    prismaMock.skill.findUnique.mockResolvedValueOnce(skillModelMock);
    const result = await repository.getSkillById(skillModelMock.id);
    expect(result).toBeDefined();
  });

  it('getSkillById: should return null when not found', async () => {
    prismaMock.skill.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getSkillById(999);
    expect(result).toBeNull();
  });

  it('updateSkill: should update skill and return it', async () => {
    prismaMock.skill.update.mockResolvedValueOnce(skillModelMock);
    const result = await repository.updateSkill({ description: 'new' }, skillModelMock.id);
    expect(result).toBeDefined();
  });

  it('updateSkill: should throw on error', async () => {
    prismaMock.skill.update.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.updateSkill({}, 999)).rejects.toThrow('falha na operação.');
  });

  it('deleteSkill: should delete skill and return it', async () => {
    prismaMock.skill.delete.mockResolvedValueOnce(skillModelMock);
    const result = await repository.deleteSkill(skillModelMock.id);
    expect(result).toBeDefined();
  });

  it('deleteSkill: should throw on error', async () => {
    prismaMock.skill.delete.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.deleteSkill(999)).rejects.toThrow('falha na operação.');
  });

  it('createBulkSkills: should create skills in bulk', async () => {
    prismaMock.skill.createMany.mockResolvedValueOnce({ count: 1 });
    const result = await repository.createBulkSkills([{ description: 'Java' }]);
    expect(result).toBeDefined();
  });
});

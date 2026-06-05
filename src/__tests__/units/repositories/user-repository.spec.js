import { jest } from '@jest/globals';
import { userModelMock } from '../factory/user-model-factory';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  userJob: {
    findMany: jest.fn(),
  },
  job: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../common/prisma/prisma.js', () => prismaMock);

const repository = (await import('../../../repositories/UserRepository.js')).default;

describe('Users Context', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getUserById: should find a user by id', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(userModelMock);
    const result = await repository.getUserById(userModelMock.id);
    expect(result).toBeDefined();
  });

  it('getUserById: should return null when not found', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getUserById(999);
    expect(result).toBeNull();
  });

  it('getUserByEmail: should find a user by email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(userModelMock);
    const result = await repository.getUserByEmail(userModelMock.email);
    expect(result).toBeDefined();
  });

  it('getUserByEmail: should return null when not found', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const result = await repository.getUserByEmail('notfound@email.com');
    expect(result).toBeNull();
  });

  it('checkExistentEmail: should not throw when email is new', async () => {
    prismaMock.user.count.mockResolvedValueOnce(0);
    await expect(repository.checkExistentEmail('new@email.com')).resolves.not.toThrow();
  });

  it('checkExistentEmail: should throw when email already exists', async () => {
    prismaMock.user.count.mockResolvedValueOnce(1);
    await expect(repository.checkExistentEmail(userModelMock.email)).rejects.toThrow('E-mail já cadastrado.');
  });

  it('createUser: should create user and return it', async () => {
    prismaMock.user.create.mockResolvedValueOnce(userModelMock);
    const body = {
      name: userModelMock.name,
      email: userModelMock.email,
      password: userModelMock.password,
    };
    const result = await repository.createUser(body);
    expect(result).toBeDefined();
  });

  it('createUser: should throw on error', async () => {
    prismaMock.user.create.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.createUser({})).rejects.toThrow();
  });

  it('updateUser: should update user and return it', async () => {
    prismaMock.user.update.mockResolvedValueOnce(userModelMock);
    const result = await repository.updateUser({ name: 'new name' }, userModelMock.id);
    expect(result).toBeDefined();
  });

  it('updateUser: should throw on error', async () => {
    prismaMock.user.update.mockRejectedValueOnce(new Error('db error'));
    await expect(repository.updateUser({}, 999)).rejects.toThrow();
  });

  it('deleteUser: should delete user and return 1', async () => {
    prismaMock.userJob.findMany.mockResolvedValueOnce([]);
    prismaMock.$transaction.mockResolvedValueOnce([{ count: 0 }, userModelMock]);
    const result = await repository.deleteUser(userModelMock.id);
    expect(result).toBe(1);
  });

  it('getAllUsers: should return users list with count', async () => {
    prismaMock.$transaction.mockResolvedValueOnce([[userModelMock], 1]);
    const result = await repository.getAllUsers();
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.count).toBe(1);
  });
});

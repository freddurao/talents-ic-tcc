import Chance from 'chance';

const chance = new Chance();

const userModelMock = {
  id: chance.integer({ min: 1 }),
  email: chance.email(),
  name: chance.string(),
  password: chance.string(),
  isAdmin: false,
  isAuthorized: true,
};

export { userModelMock };

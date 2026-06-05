import Chance from 'chance';

const chance = new Chance();

const skillModelMock = {
  id: chance.integer({ min: 1 }),
  description: chance.string(),
};

export { skillModelMock };

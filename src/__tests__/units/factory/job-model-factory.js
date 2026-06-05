import Chance from 'chance';

const chance = new Chance();

const jobModelMock = {
  id: chance.integer({ min: 1 }),
  description: chance.string(),
  title: chance.string(),
  site: chance.string(),
  type: chance.string(),
  workload: chance.floating({ min: 1 }),
  salary: chance.floating({ min: 1 }),
  endingDate: chance.date().toISOString().split('T')[0],
  startingDate: chance.date().toISOString().split('T')[0],
  scholarity: chance.string(),
  createdAt: chance.date().toISOString().split('T')[0],
};

export { jobModelMock };

import Chance from 'chance';

const chance = new Chance();

const USER_JOB = 1;
const USER_JOB_INCLUDE_JOB = 2;
const USER_JOB_INCLUDE_JOB_AND_USER = 3;

const createUser_JobModelMock = (type) => {
  const base = {
    jobId: chance.integer({ min: 1 }),
  };

  if (type === USER_JOB) {
    return {
      ...base,
      userId: chance.integer({ min: 1 }),
      created: chance.bool(),
    };
  }

  const job = {
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

  if (type === USER_JOB_INCLUDE_JOB) {
    return { ...base, job };
  }

  return {
    ...base,
    userId: chance.integer({ min: 1 }),
    created: true,
    job,
    user: {
      name: chance.string({ max: 255 }),
      email: chance.email(),
      isAdmin: false,
      isAuthorized: true,
    },
  };
};

export default { createUser_JobModelMock, USER_JOB, USER_JOB_INCLUDE_JOB, USER_JOB_INCLUDE_JOB_AND_USER };

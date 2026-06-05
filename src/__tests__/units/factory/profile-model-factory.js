import Chance from 'chance';

const chance = new Chance();

const createProfileModelMock = (basic) => {
  const profile = {
    id: chance.integer({ min: 1 }),
    birthDate: chance.date(),
    scholarity: chance.string({ max: 30 }),
    knowledge: chance.string(),
    technologies: chance.string(),
    languages: chance.string({ max: 255 }),
    linkResume: chance.string({ max: 255 }),
    searchable: chance.bool(),
    github: null,
    city: null,
    gender: null,
    userId: chance.integer({ min: 1 }),
  };

  if (!basic) {
    profile.user = {
      name: chance.string({ max: 255 }),
      email: chance.email(),
      isAdmin: false,
      isAuthorized: true,
    };
  }

  return profile;
};

export default { createProfileModelMock };

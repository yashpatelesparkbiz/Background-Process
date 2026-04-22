import { faker } from "@faker-js/faker";

function createRandomUser() {
  return {
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    info: {
      job_title: faker.person.jobTitle(),
      salary: faker.number.int({ min: 20000, max: 200000, multipleOf: 1000 }),
    },
  };
}

export default function getUsers(count: number) {
  return faker.helpers.multiple(createRandomUser, {
    count: count,
  });
}

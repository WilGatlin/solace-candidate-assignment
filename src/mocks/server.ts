import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/advocates', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            city: 'New York',
            degree: 'MD',
            specialties: ['ADHD', 'Nutrition'],
            yearsOfExperience: 5,
            phoneNumber: '1234567890',
          },
        ],
      }),
    );
  }),
);

export { server };

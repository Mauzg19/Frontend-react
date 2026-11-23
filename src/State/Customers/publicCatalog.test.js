import { api } from '../../config/api';
import { getRestaurantById, getRestaurantsCategory } from './Restaurant/restaurant.action';
import { getMenuItemsByRestaurantId, searchMenuItem } from './Menu/menu.action';

jest.mock('../../config/api', () => ({ api: { get: jest.fn() } }));

test.each([
  ['restaurant', getRestaurantById, { restaurantId: 1, jwt: null }],
  ['categories', getRestaurantsCategory, { restaurantId: 1, jwt: null }],
  ['menu', getMenuItemsByRestaurantId, { restaurantId: 1, jwt: null, foodCategory: '' }],
  ['search', searchMenuItem, { keyword: 'Hamburguesa', jwt: null }],
])('public %s request does not transmit a null token', async (_, action, input) => {
  api.get.mockReset().mockResolvedValue({ data: [] });
  const dispatch = jest.fn();
  await action(input)(dispatch);
  expect(api.get).toHaveBeenCalledTimes(1);
  const [, options] = api.get.mock.calls[0];
  expect(options?.headers || {}).not.toHaveProperty('Authorization');
  expect(dispatch.mock.calls.at(-1)[0].type).not.toMatch(/FAILURE/);
});

test('dashboard menu without explicit filters requests all products with valid booleans', async () => {
  api.get.mockReset().mockResolvedValue({ data: [{ id: 1, name: 'Hamburguesa' }] });
  const dispatch = jest.fn();
  await getMenuItemsByRestaurantId({ restaurantId: 1, jwt: 'synthetic-token' })(dispatch);
  const [url] = api.get.mock.calls[0];
  const params = new URL(url, 'https://example.test').searchParams;
  expect(params.get('vegetarian')).toBe('false');
  expect(params.get('nonveg')).toBe('false');
  expect(params.get('seasonal')).toBe('false');
  expect(params.get('food_category')).toBe('');
  expect(dispatch.mock.calls.at(-1)[0].payload).toEqual([{ id: 1, name: 'Hamburguesa' }]);
});

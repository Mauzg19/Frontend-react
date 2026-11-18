import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import RestaurantsOrder from './RestaurantsOrder';
import { fetchRestaurantsOrder } from '../../State/Admin/Order/restaurants.order.action';

jest.mock('./OrderTable', () => () => <div>Pedidos</div>);
jest.mock('../../State/Admin/Order/restaurants.order.action', () => ({
  fetchRestaurantsOrder: jest.fn(payload => ({ type: 'fixture/orders-request', payload })),
}));

test('waits for restaurant and reloads for token or restaurant changes without loops', async () => {
  fetchRestaurantsOrder.mockClear();
  fetchRestaurantsOrder.mockImplementation(payload => ({ type: 'fixture/orders-request', payload }));
  const initial = { auth: { jwt: 'synthetic-token-a' }, restaurant: { usersRestaurant: null } };
  const store = createStore((state = initial, action) => action.type === 'fixture/replace' ? action.payload : state);
  render(<Provider store={store}><MemoryRouter initialEntries={['/orders?order_status=PENDING']}><RestaurantsOrder /></MemoryRouter></Provider>);
  expect(fetchRestaurantsOrder).not.toHaveBeenCalled();
  const owner = { ...initial, restaurant: { usersRestaurant: { id: 7 } } };
  act(() => store.dispatch({ type: 'fixture/replace', payload: owner }));
  await waitFor(() => expect(fetchRestaurantsOrder).toHaveBeenCalledWith({ restaurantId: 7, orderStatus: 'PENDING', jwt: 'synthetic-token-a' }));
  act(() => store.dispatch({ type: 'fixture/replace', payload: { ...owner, restaurant: { usersRestaurant: { id: 7 } } } }));
  expect(fetchRestaurantsOrder).toHaveBeenCalledTimes(1);
  const refreshed = { ...owner, auth: { jwt: 'synthetic-token-b' } };
  act(() => store.dispatch({ type: 'fixture/replace', payload: refreshed }));
  await waitFor(() => expect(fetchRestaurantsOrder).toHaveBeenCalledTimes(2));
  expect(fetchRestaurantsOrder).toHaveBeenLastCalledWith({ restaurantId: 7, orderStatus: 'PENDING', jwt: 'synthetic-token-b' });
  act(() => store.dispatch({ type: 'fixture/replace', payload: { ...refreshed, restaurant: { usersRestaurant: { id: 8 } } } }));
  await waitFor(() => expect(fetchRestaurantsOrder).toHaveBeenLastCalledWith({ restaurantId: 8, orderStatus: 'PENDING', jwt: 'synthetic-token-b' }));
});

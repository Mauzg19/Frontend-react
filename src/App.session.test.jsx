import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import { getUser } from './State/Authentication/Action';
import { findCart } from './State/Customers/Cart/cart.action';
import { getAllRestaurantsAction, getRestaurantByUserId } from './State/Customers/Restaurant/restaurant.action';

jest.mock('./Routers/Routers', () => () => <div>Rutas</div>);
jest.mock('./components/ChatbotWidget', () => () => null);
jest.mock('./State/Authentication/Action', () => ({ getUser: jest.fn(payload => ({ type: 'fixture/profile', payload })) }));
jest.mock('./State/Customers/Cart/cart.action', () => ({ findCart: jest.fn(payload => ({ type: 'fixture/cart', payload })) }));
jest.mock('./State/Customers/Restaurant/restaurant.action', () => ({
  getAllRestaurantsAction: jest.fn(() => ({ type: 'fixture/restaurants' })),
  getRestaurantByUserId: jest.fn(payload => ({ type: 'fixture/owner-restaurant', payload })),
}));

test('uses the active session and avoids refetching on equivalent profile updates', async () => {
  jest.clearAllMocks();
  getUser.mockImplementation(payload => ({ type: 'fixture/profile', payload }));
  findCart.mockImplementation(payload => ({ type: 'fixture/cart', payload }));
  getRestaurantByUserId.mockImplementation(payload => ({ type: 'fixture/owner-restaurant', payload }));
  getAllRestaurantsAction.mockImplementation(() => ({ type: 'fixture/restaurants' }));
  localStorage.clear();
  const initial = { auth: { jwt: 'synthetic-token-a', user: { role: 'ROLE_RESTAURANT_OWNER' } } };
  const store = createStore((state = initial, action) => action.type === 'fixture/replace' ? action.payload : state);
  render(<Provider store={store}><App /></Provider>);
  await waitFor(() => expect(getUser).toHaveBeenCalledWith('synthetic-token-a'));
  expect(findCart).toHaveBeenCalledWith('synthetic-token-a');
  expect(getRestaurantByUserId).toHaveBeenCalledTimes(1);
  act(() => store.dispatch({ type: 'fixture/replace', payload: { auth: { ...initial.auth, user: { role: 'ROLE_RESTAURANT_OWNER', fullName: 'Owner QA' } } } }));
  expect(getRestaurantByUserId).toHaveBeenCalledTimes(1);
  expect(getUser).toHaveBeenCalledTimes(1);
  act(() => store.dispatch({ type: 'fixture/replace', payload: { auth: { ...initial.auth, jwt: 'synthetic-token-b' } } }));
  await waitFor(() => expect(getRestaurantByUserId).toHaveBeenCalledTimes(2));
  expect(getUser).toHaveBeenLastCalledWith('synthetic-token-b');
  expect(findCart).toHaveBeenLastCalledWith('synthetic-token-b');
});

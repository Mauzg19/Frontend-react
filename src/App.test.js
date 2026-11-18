/**
 * Smoke test — validates store shape and auth reducer initial state.
 * Does NOT render App (avoids CRA + ESM node_modules issues in Jest).
 * Full integration tests run via dev server.
 */
import { store } from './State/Store/store';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render, screen } from '@testing-library/react';
import RestaurantTable from './SuperAdmin/Restaurants/RestaurantTable';

test('Redux store initializes with expected shape', () => {
  const state = store.getState();
  expect(state).toHaveProperty('auth');
  expect(state).toHaveProperty('restaurant');
  expect(state).toHaveProperty('cart');
});

test('auth initial state is correct', () => {
  const { auth } = store.getState();
  expect(auth.user).toBeNull();
  expect(auth.jwt).toBeNull();
  expect(auth.isLoading).toBe(false);
  expect(Array.isArray(auth.favorites)).toBe(true);
});

test('super admin restaurant table tolerates restaurants without address or images', () => {
  const testStore = createStore(() => ({
    restaurant: {
      loading: false,
      restaurants: [
        {
          id: 1,
          name: 'Restaurante sin direccion',
          owner: null,
          cuisineType: null,
          address: null,
          contactInformation: null,
          images: [],
        },
      ],
    },
  }));

  render(
    <Provider store={testStore}>
      <RestaurantTable name="Restaurantes" />
    </Provider>
  );

  expect(screen.getByText('Restaurante sin direccion')).toBeInTheDocument();
  expect(screen.getByText('Sin dirección')).toBeInTheDocument();
});

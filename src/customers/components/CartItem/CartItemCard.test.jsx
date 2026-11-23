import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CartItemCard from './CartItemCard';
import { removeCartItem, updateCartItem } from '../../../State/Customers/Cart/cart.action';

jest.mock('../../../State/Customers/Cart/cart.action', () => ({
  removeCartItem: jest.fn(), updateCartItem: jest.fn(),
}));
jest.mock('../../../config/api', () => ({ API_URL: 'http://127.0.0.1:15454' }));

test.each([1, '1'])('decrementing the last item removes it for quantity %p', quantity => {
  removeCartItem.mockImplementation(payload => ({ type: 'fixture/remove', payload }));
  updateCartItem.mockClear();
  const store = createStore(() => ({ auth: { jwt: 'synthetic-token' } }));
  render(<Provider store={store}><CartItemCard item={{ id: 17, quantity, food: { name: 'Arepa QA' }, totalPrice: 15000 }} /></Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Disminuir cantidad' }));
  expect(removeCartItem).toHaveBeenLastCalledWith({ cartItemId: 17, jwt: 'synthetic-token' });
  expect(updateCartItem).not.toHaveBeenCalled();
});

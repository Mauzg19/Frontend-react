import { render, screen, fireEvent } from '@testing-library/react';
import DemandPrediction from './DemandPrediction';
import { api } from '../../config/api';

jest.mock('../../config/api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const request = { product: 'Hamburguesa', date: '2026-09-01', lag1: 38, lag7: 40, mean7: 65.71428571428571 };
const report = {
  modelId: 'demanda-mlp-v2-seed42', rawRows: 1825, warmupRows: 35,
  metrics: { 'Red neuronal': { MAE: 3.0503864, RMSE: 3.90052, R2: 0.95993 } },
  products: ['Hamburguesa'], examples: [{ request }], predictions: [], history: [],
  architecture: [13, 32, 16, 1], parameters: 993, bestEpoch: 47, epochs: 92,
  splits: {}, bestTestMAE: 'Red neuronal', historyMetric: 'MAE',
  training: { dropout: 0, l2: 0.0001, batchSize: 32, selectionMetric: 'MAE de validación' },
};

beforeEach(() => jest.clearAllMocks());

test('shows the v2 identity and correct learning-curve units', async () => {
  api.get.mockResolvedValue({ data: report });
  render(<DemandPrediction />);
  expect(await screen.findByText('Modelo demanda-mlp-v2-seed42')).toBeInTheDocument();
  expect(screen.getByText(/Error absoluto medio \(MAE\), en unidades/)).toBeInTheDocument();
  expect(screen.getByText(/Dropout 0%/)).toHaveTextContent('993 parámetros');
});

test('supports reports from the previous backend while clients are updated', async () => {
  api.get.mockResolvedValue({ data: { ...report, training: undefined, historyMetric: undefined } });
  render(<DemandPrediction />);
  expect(await screen.findByText(/Dropout 10%/)).toBeInTheDocument();
  expect(screen.getByText(/Pérdida MSE \+ regularización/)).toBeInTheDocument();
});

test('posts entered history and renders v2 units, then clears stale results', async () => {
  api.get.mockResolvedValue({ data: report });
  api.post.mockResolvedValue({ data: { ...request, units: 49.5772915144, roundedUnits: 50 } });
  render(<DemandPrediction />);
  fireEvent.click(await screen.findByRole('button', { name: 'Estimar demanda' }));
  expect(await screen.findByText(/49,58 unidades estimadas/)).toBeInTheDocument();
  expect(api.post.mock.calls[0][1]).toEqual(request);
  fireEvent.change(screen.getByLabelText(/Unidades del día anterior/), { target: { value: '42' } });
  expect(screen.queryByText(/49,58 unidades estimadas/)).not.toBeInTheDocument();
});

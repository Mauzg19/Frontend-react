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

test('loads the selected calendar week, excludes the target day and clears incomplete history', async () => {
  const series = [3, 0, 2, 4, 6, 8, 10, 12, 14].map((units, i) => ({
    date: '2026-08-' + (23+i), product:'Hamburguesa', units
  }));
  api.get.mockResolvedValue({data:{...report, series}});
  render(<DemandPrediction />);
  const date = await screen.findByLabelText(/Fecha del escenario/);
  fireEvent.change(date, {target:{value:'2026-08-31'}});
  expect(screen.getByLabelText(/día anterior/)).toHaveValue(12);
  expect(screen.getByLabelText(/hace siete días/)).toHaveValue(0);
  expect(screen.getByLabelText(/Promedio de los siete/)).toHaveValue(6);
  fireEvent.change(date, {target:{value:'2026-09-03'}});
  expect(screen.getByLabelText(/día anterior/)).toHaveValue(null);
  expect(screen.getByText(/Faltan datos/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'Estimar demanda'}));
  expect(api.post).not.toHaveBeenCalled();
});

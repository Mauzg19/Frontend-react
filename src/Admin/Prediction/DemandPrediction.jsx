import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { api } from '../../config/api';

const number = value => Number(value).toLocaleString('es-CO', { maximumFractionDigits: 2 });
const colors = ['#78a5ff', '#ffad72'];
function Lines({ rows, keys, title, label }) {
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.flatMap(row => keys.map(key => row[key])));
  const points = key => rows.map((r, i) => `${55 + i * 650 / Math.max(1, rows.length - 1)},${210 - r[key] * 175 / max}`).join(' ');
  return <Box sx={{ minWidth: 0 }}><Typography variant="h6">{title}</Typography>
    <svg viewBox="0 0 740 255" role="img" aria-label={title} style={{ width: '100%', maxHeight: 280 }}>
      {[0, 0.5, 1].map(t => <g key={t}><line x1="55" x2="705" y1={210-t*175} y2={210-t*175} stroke="#555" />
        <text x="45" y={215-t*175} fill="#ddd" textAnchor="end" fontSize="13">{number(t*max)}</text></g>)}
      {keys.map((key,i) => <polyline key={key} points={points(key)} fill="none" stroke={colors[i]} strokeWidth="2.8" />)}
      <text x="55" y="242" fill="#ddd" fontSize="14">{label(rows[0])}</text>
      <text x="705" y="242" fill="#ddd" fontSize="14" textAnchor="end">{label(rows[rows.length-1])}</text>
    </svg>
    <Stack direction="row" spacing={2}>{keys.map((k,i) => <Typography key={k} sx={{color:colors[i]}}>{k === 'actual' ? 'Observado sintético' : k === 'predicted' ? 'Red neuronal' : k === 'train' ? 'Entrenamiento' : 'Validación'}</Typography>)}</Stack>
  </Box>;
}

function historicalForm(report, product, date) {
  const history = new Map((report.series || []).filter(r => r.product === product).map(r => [r.date, r.units]));
  const day = Date.parse(date + 'T00:00:00Z');
  if (Number.isFinite(day)) {
    const week = Array.from({length:7}, (_, i) => history.get(new Date(day - (i+1)*86400000).toISOString().slice(0,10)));
    if (week.every(Number.isFinite)) {
      return {product, date, lag1:week[0], lag7:week[6], mean7:week.reduce((sum,n) => sum+n,0)/7};
    }
  }
  if (!report.series) {
    const saved = report.examples.find(e => e.request.product === product && e.request.date === date);
    if (saved) return {...saved.request};
  }
  return {product, date, lag1:'', lag7:'', mean7:''};
}

export default function DemandPrediction() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [missingWeek, setMissingWeek] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('jwt')}` });
  useEffect(() => {
    let active = true;
    setError('');
    api.get('/api/admin/demand/report', { headers: headers() }).then(({data}) => {
      if (!active) return;
      const example = data.examples.find(({ request }) => request.product === 'Hamburguesa') ?? data.examples[0];
      const initial = historicalForm(data, example.request.product, example.request.date);
      setReport(data); setForm(initial); setMissingWeek(initial.lag1 === '');
    }).catch(() => { if (active) setError('No se pudo cargar el modelo. Comprueba la conexión e intenta de nuevo.'); });
    return () => { active = false; };
  }, [attempt]);
  const update = (key, value) => { setForm({...form, [key]:value}); setResult(null); setError(''); };
  function selectScenario(product, date) {
    const next = historicalForm(report, product, date);
    setForm(next); setMissingWeek(next.lag1 === ''); setResult(null); setError('');
  }
  async function predict(event) {
    event.preventDefault();
    if (busy || !form.date || [form.lag1, form.lag7, form.mean7].some(value => value === '')) return;
    setBusy(true); setResult(null); setError('');
    try {
      const {data} = await api.post('/api/admin/demand/predict', {
        ...form, lag1:Number(form.lag1), lag7:Number(form.lag7), mean7:Number(form.mean7)
      }, {headers:headers()});
      setResult(data);
    } catch { setError('No se pudo calcular la estimación. Revisa los datos y la conexión.'); }
    finally { setBusy(false); }
  }
  if (!report) return <Box p={3}>{error ? <><Alert severity="error">{error}</Alert><Button onClick={() => setAttempt(attempt+1)}>Reintentar</Button></> : <CircularProgress aria-label="Cargando modelo" />}</Box>;
  const test = report.metrics['Red neuronal'];
  const training = report.training;
  const rows = report.predictions.filter(row => row.product === form.product);
  return <Box sx={{p:{xs:2, md:4}, maxWidth:1400, mx:'auto'}}>
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap"><Typography variant="h4">Minería de demanda</Typography><Chip label="Datos sintéticos · prototipo académico" color="warning" variant="outlined" /></Stack>
    {report.modelId && <Typography sx={{mt:1}}>Modelo {report.modelId}</Typography>}
    <Typography sx={{mt:1, mb:3, color:'text.secondary'}}>Estima unidades por producto para un día. Historial simulado de un restaurante; separado de tus pedidos operativos.</Typography>
    <Stack direction={{xs:'column', sm:'row'}} spacing={2} sx={{mb:3}}>
      {[[number(report.rawRows),'Registros sintéticos'], [number(test.MAE),'MAE · unidades'], [number(test.RMSE),'RMSE · unidades'], [number(test.R2),'R² · prueba']].map(([v,l]) => <Paper key={l} variant="outlined" sx={{p:2, flex:1}}><Typography variant="h4">{v}</Typography><Typography>{l}</Typography></Paper>)}
    </Stack>
    <Paper variant="outlined" sx={{p:{xs:2,md:3},mb:3}}>
      <Typography variant="h5" gutterBottom>Probar un escenario</Typography>
      <Typography sx={{mb:2}}>Elige producto y fecha. Los tres campos se llenan con sus ventas de los siete días anteriores en el historial sintético. Puedes editar los valores para ensayar otro escenario.</Typography>
      {missingWeek && <Alert severity="info" sx={{mb:2}}>Faltan datos para completar los siete días anteriores. Elige otra fecha o ingresa el historial manualmente.</Alert>}
      <Box component="form" onSubmit={predict} sx={{display:'grid', gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr',md:'repeat(3,1fr)'},gap:2}}>
        <TextField select label="Producto" value={form.product} disabled={busy} onChange={e => selectScenario(e.target.value, form.date)}>{report.products.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</TextField>
        <TextField label="Fecha del escenario" type="date" value={form.date} disabled={busy} required InputLabelProps={{shrink:true}} onChange={e => selectScenario(form.product, e.target.value)} />
        {[['lag1','Unidades del día anterior'],['lag7','Unidades de hace siete días'],['mean7','Promedio de los siete días anteriores']].map(([key,label]) => <TextField key={key} type="number" label={label} value={form[key]} disabled={busy} required inputProps={{min:0,max:10000,step:'any'}} onChange={e => update(key,e.target.value)} />)}
        <Button type="submit" variant="contained" disabled={busy} sx={{background:'#c86700',color:'#fff'}}>{busy ? 'Calculando…' : 'Estimar demanda'}</Button>
      </Box>
      {error && <Alert severity="error" sx={{mt:2}}>{error}</Alert>}
      {result && <Alert severity="info" sx={{mt:2}} role="status"><strong>{result.product} · {result.date} · {number(result.units)} unidades estimadas</strong><br/>Referencia redondeada {result.roundedUnits} unidades. Estimación puntual, sin porcentaje de confianza.</Alert>}
    </Paper>
    <Paper variant="outlined" sx={{p:3,mb:3}}><Lines rows={rows} keys={['actual','predicted']} title={`Observado y predicho · ${form.product}`} label={r=>r.date}/><Typography sx={{mt:1}}>Prueba cronológica, un día adelante con historia conocida hasta el día anterior. Unidades por día.</Typography></Paper>
    <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:3}}>
      <Paper variant="outlined" sx={{p:3,minWidth:0}}><Lines rows={report.history} keys={['train','validation']} title="Curva de aprendizaje" label={r=>`Época ${r.epoch}`}/><Typography sx={{mt:1}}>{report.historyMetric === 'MAE' ? 'Error absoluto medio (MAE), en unidades.' : 'Pérdida MSE + regularización, reescalada.'} Se restauraron los pesos de la época {report.bestEpoch}; {report.epochs} épocas ejecutadas.</Typography></Paper>
      <Paper variant="outlined" sx={{p:3}}><Typography variant="h6" gutterBottom>Comparación en la misma prueba</Typography>
        <Box component="table" sx={{width:'100%', '& th, & td':{py:1,textAlign:'left',borderBottom:'1px solid #444'}}}><thead><tr><th>Modelo</th><th>MAE</th><th>RMSE</th><th>R²</th></tr></thead><tbody>{Object.entries(report.metrics).map(([name,m]) => <tr key={name}><td>{name}</td><td>{number(m.MAE)}</td><td>{number(m.RMSE)}</td><td>{number(m.R2)}</td></tr>)}</tbody></Box>
        <Typography sx={{mt:2}}>Menor MAE es mejor. R² no es un porcentaje de exactitud. Mejor MAE observado en este escenario: {report.bestTestMAE}.</Typography>
      </Paper>
    </Box>
    <Paper variant="outlined" sx={{p:3,mt:3}}><Typography variant="h6">Cómo se entrenó</Typography><Typography>Red densa {report.architecture.join(' → ')} · ReLU · Dropout {training ? number(training.dropout * 100) : 10}% · L2{training ? ` ${Number(training.l2).toLocaleString('es-CO', { maximumFractionDigits: 4 })}` : ''} · Adam · {report.parameters} parámetros.</Typography>
      {training && <Typography>Lotes de {training.batchSize}. Selección por {training.selectionMetric}.</Typography>}
      {report.comparison && <Typography>MAE anterior {number(report.comparison.previous.MAE)}; MAE actual {number(test.MAE)}. Reducción descriptiva del {number(report.comparison.maeReductionPercent)}% sobre la misma prueba sintética previamente evaluada.</Typography>}
      {Object.entries(report.splits).map(([name,s]) => <Typography key={name}>{({train:'Entrenamiento',validation:'Validación',test:'Prueba'})[name]}: {s.start} a {s.end}, {s.rows} filas.</Typography>)}
      <Typography sx={{mt:1}}>Escalado ajustado solo en entrenamiento. {report.warmupRows} filas iniciales se usan para construir la historia de siete días.</Typography>
      <Alert severity="warning" sx={{mt:2}}>Las métricas corresponden exclusivamente a datos sintéticos. El modelo debe validarse con ventas reales antes de tomar decisiones de inventario.</Alert>
    </Paper>
  </Box>;
}

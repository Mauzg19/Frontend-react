import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

const defaultInputs = {
  ganancia1: 160,
  ganancia2: 135,
  ganancia3: 120,
  demanda1: 20,
  demanda2: 15,
  demanda3: 25,
  capacidad: 50,
};

const FLASK_API_URL = "http://localhost:5000";

const ModeloMatematico = () => {
  const [inputs, setInputs] = useState(defaultInputs);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: Number(value) });
  };

  const handleResolve = async () => {
    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const ganancias = [inputs.ganancia1, inputs.ganancia2, inputs.ganancia3];
      const demandas = [inputs.demanda1, inputs.demanda2, inputs.demanda3];
      const capacidad = inputs.capacidad;

      const response = await fetch(`${FLASK_API_URL}/resolver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ganancias,
          demandas,
          capacidad,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al conectar con el servidor de optimización");
      }

      const result = await response.json();

      if (result.status === "success") {
        setSolution({
          pizzas: result.pizzas,
          pastas: result.pastas,
          ensaladas: result.ensaladas,
          gananciaMaxima: result.ganancia_maxima,
          usedCapacity: result.pizzas + result.pastas + result.ensaladas,
          remainingCapacity: capacidad - (result.pizzas + result.pastas + result.ensaladas),
        });
      } else {
        setError(result.message || "Error al resolver el modelo");
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}. ¿Está ejecutando el servidor Flask en puerto 5000?`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    setLoading(true);
    setError(null);

    try {
      const ganancias = [inputs.ganancia1, inputs.ganancia2, inputs.ganancia3];
      const demandas = [inputs.demanda1, inputs.demanda2, inputs.demanda3];
      const capacidad = inputs.capacidad;

      const response = await fetch(`${FLASK_API_URL}/guardar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ganancias,
          demandas,
          capacidad,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los parámetros");
      }

      alert("Parámetros guardados correctamente en la base de datos");
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:px-20 px-5 py-8">
      <Card>
        <CardHeader
          title={<span className="text-gray-300 text-3xl font-bold">Modelo Matemático</span>}
          subheader={
            <span className="text-gray-400">
              Implementación de Investigación de Operaciones - Programación Lineal con Pyomo + HiGHS Solver
            </span>
          }
        />
        <CardContent>
          <Alert severity="info" className="mb-4">
            Este módulo utiliza el servidor Flask (Pyomo + HiGHS) para resolver el problema de optimización real.
            Asegúrate de tener ejecutando: <code>python app.py</code> en la carpeta mG
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className="bg-slate-900 border border-slate-700">
                <CardHeader title={<span className="text-gray-200">Parámetros</span>} className="pb-0" />
                <CardContent className="space-y-4">
                  <TextField
                    label="Ganancia Pizza"
                    name="ganancia1"
                    type="number"
                    fullWidth
                    value={inputs.ganancia1}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Ganancia Pasta"
                    name="ganancia2"
                    type="number"
                    fullWidth
                    value={inputs.ganancia2}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Ganancia Ensalada"
                    name="ganancia3"
                    type="number"
                    fullWidth
                    value={inputs.ganancia3}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Demanda Pizza"
                    name="demanda1"
                    type="number"
                    fullWidth
                    value={inputs.demanda1}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Demanda Pasta"
                    name="demanda2"
                    type="number"
                    fullWidth
                    value={inputs.demanda2}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Demanda Ensalada"
                    name="demanda3"
                    type="number"
                    fullWidth
                    value={inputs.demanda3}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <TextField
                    label="Capacidad Total"
                    name="capacidad"
                    type="number"
                    fullWidth
                    value={inputs.capacidad}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 1 }}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleResolve}
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Resolver Modelo"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleGuardar}
                      fullWidth
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="bg-slate-900 border border-slate-700">
                <CardHeader
                  title={<span className="text-gray-200">Modelo de Optimización</span>}
                  className="pb-0"
                />
                <CardContent>
                  <Typography className="text-gray-300 mb-2 font-semibold">Variables de Decisión:</Typography>
                  <Typography className="text-gray-300">x₁ = Porciones de pizzas</Typography>
                  <Typography className="text-gray-300">x₂ = Porciones de pastas</Typography>
                  <Typography className="text-gray-300">x₃ = Porciones de ensaladas</Typography>

                  <Typography className="text-gray-300 mt-4 font-semibold">Función Objetivo (Maximizar):</Typography>
                  <Typography className="text-gray-300">Z = 160x₁ + 135x₂ + 120x₃</Typography>

                  <Typography className="text-gray-300 mt-4 font-semibold">Restricciones:</Typography>
                  <Typography className="text-gray-300 text-sm">x₁ + x₂ + x₃ ≤ capacidad</Typography>
                  <Typography className="text-gray-300 text-sm">x₁ ≤ demanda pizza</Typography>
                  <Typography className="text-gray-300 text-sm">x₂ ≤ demanda pasta</Typography>
                  <Typography className="text-gray-300 text-sm">x₃ ≤ demanda ensalada</Typography>
                  <Typography className="text-gray-300 text-sm">x₁, x₂, x₃ ≥ 0</Typography>

                  <Typography className="text-gray-300 mt-4 font-semibold">Solver:</Typography>
                  <Typography className="text-gray-300 text-sm">Pyomo + HiGHS</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && (
            <>
              <Divider className="my-4" />
              <Alert severity="error">{error}</Alert>
            </>
          )}

          {solution && (
            <>
              <Divider className="my-6" />
              <Card className="bg-slate-900 border border-slate-700">
                <CardHeader
                  title={<span className="text-gray-200">Solución Óptima</span>}
                  className="pb-0"
                />
                <CardContent>
                  <TableContainer component={Paper} className="bg-slate-950">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell className="text-gray-300 font-semibold">Plato</TableCell>
                          <TableCell className="text-gray-300 font-semibold" align="right">Porciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-gray-300">Pizza</TableCell>
                          <TableCell className="text-gray-300" align="right">{solution.pizzas}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-gray-300">Pasta</TableCell>
                          <TableCell className="text-gray-300" align="right">{solution.pastas}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-gray-300">Ensalada</TableCell>
                          <TableCell className="text-gray-300" align="right">{solution.ensaladas}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography className="text-gray-200 mt-4 font-semibold text-lg">
                    Ganancia Máxima: ${solution.gananciaMaxima}
                  </Typography>
                  <Typography className="text-gray-300 mt-2">
                    Capacidad usada: {solution.usedCapacity} / {inputs.capacidad} porciones
                  </Typography>
                  <Typography className="text-gray-300">
                    Capacidad restante: {solution.remainingCapacity} porciones
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}

          <Divider className="my-6" />

          <Card className="bg-blue-950 border border-blue-700">
            <CardHeader title={<span className="text-blue-200 text-2xl font-bold">¿Qué es este modelo?</span>} />
            <CardContent className="space-y-4">
              <Typography className="text-blue-100">
                Este modelo resuelve un problema común en restaurantes: <strong>¿Cuántas porciones de cada plato debo preparar para ganar el máximo dinero?</strong>
              </Typography>

              <Typography className="text-blue-100 font-semibold mt-4">📌 El Problema:</Typography>
              <Typography className="text-blue-100">
                Tu restaurante tiene una capacidad limitada (máximo de porciones que puedes preparar).
                Cada plato tiene una ganancia diferente y una demanda máxima de clientes.
                Necesitas decidir cuántas porciones preparar de cada plato para maximizar tus ganancias.
              </Typography>

              <Typography className="text-blue-100 font-semibold mt-4">💡 Cómo usar el modelo:</Typography>
              <Typography className="text-blue-100">
                1. <strong>Ganancia:</strong> Ingresa la ganancia que obtienes por cada plato (después de costos)
              </Typography>
              <Typography className="text-blue-100">
                2. <strong>Demanda:</strong> Ingresa cuántas porciones máximo creen que venderán de cada plato
              </Typography>
              <Typography className="text-blue-100">
                3. <strong>Capacidad:</strong> Ingresa el máximo total de porciones que puedes preparar
              </Typography>
              <Typography className="text-blue-100">
                4. Presiona <strong>"Resolver Modelo"</strong>
              </Typography>

              <Typography className="text-blue-100 font-semibold mt-4">📊 Qué significa la solución:</Typography>
              <Typography className="text-blue-100">
                El modelo te dirá exactamente cuántas porciones preparar de cada plato para:
              </Typography>
              <Typography className="text-blue-100">
                ✅ <strong>Maximizar tus ganancias totales</strong> del día
              </Typography>
              <Typography className="text-blue-100">
                ✅ <strong>Usar toda tu capacidad de producción</strong> eficientemente
              </Typography>
              <Typography className="text-blue-100">
                ✅ <strong>Respetar la demanda de tus clientes</strong>
              </Typography>

              <Typography className="text-blue-100 font-semibold mt-4">📈 Ejemplo práctico:</Typography>
              <Typography className="text-blue-100">
                Si tu ganancia es: Pizza $160, Pasta $135, Ensalada $120
              </Typography>
              <Typography className="text-blue-100">
                Y puedes preparar máximo 50 porciones totales
              </Typography>
              <Typography className="text-blue-100">
                El modelo te dice: <strong>"Prepara 20 pizzas, 15 pastas y 15 ensaladas"</strong>
              </Typography>
              <Typography className="text-green-300 font-bold">
                Resultado: Ganarás $7,025 en el día
              </Typography>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeloMatematico;

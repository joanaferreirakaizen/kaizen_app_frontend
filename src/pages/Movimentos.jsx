import { useState, useEffect, useCallback } from 'react';
import { stocksAPI, materiaPrimaAPI } from '../services/api';

export default function Movimentos() {
  const [movements, setMovements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback((mpId = '') => {
    setLoading(true);
    const params = mpId ? { materia_prima_id: mpId } : {};
    stocksAPI
      .getAll(params)
      .then((res) => setMovements(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    materiaPrimaAPI.getAll().then((res) => setMaterials(res.data));
  }, [load]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilter(val);
    load(val);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalEntradas = movements
    .filter((m) => !m.quer_reduzir)
    .reduce((acc, m) => acc + parseFloat(m.quantidade), 0);

  const totalSaidas = movements
    .filter((m) => m.quer_reduzir)
    .reduce((acc, m) => acc + parseFloat(m.quantidade), 0);

  return (
    <div className="page">
      <h1>Movimentos de Stock</h1>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        <div className="stat-card">
          <div className="stat-value">{movements.length}</div>
          <div className="stat-label">Total de Movimentos</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{movements.filter((m) => !m.quer_reduzir).length}</div>
          <div className="stat-label">Entradas</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{movements.filter((m) => m.quer_reduzir).length}</div>
          <div className="stat-label">Saídas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            +{totalEntradas.toFixed(3)}
          </div>
          <div className="stat-label">Total Entrado</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            -{totalSaidas.toFixed(3)}
          </div>
          <div className="stat-label">Total Saído</div>
        </div>
      </div>

      <div className="filters">
        <div className="form-group">
          <label>Filtrar por Matéria-Prima</label>
          <select value={filter} onChange={handleFilterChange}>
            <option value="">Todos os movimentos</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.descricao} ({m.largura}×{m.comprimento}×{m.espessura} mm)
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={() => load(filter)}>
          Atualizar
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Matéria-Prima</th>
              <th>Dimensões (mm)</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">A carregar...</td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">Sem movimentos registados.</td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.descricao}</td>
                  <td>{m.largura} × {m.comprimento} × {m.espessura}</td>
                  <td>
                    <span className={`badge ${m.quer_reduzir ? 'badge-danger' : 'badge-success'}`}>
                      {m.quer_reduzir ? '− Saída' : '+ Entrada'}
                    </span>
                  </td>
                  <td className={m.quer_reduzir ? 'text-danger' : 'text-success'}>
                    {m.quer_reduzir ? '−' : '+'}{m.quantidade}
                  </td>
                  <td>{formatDate(m.data)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

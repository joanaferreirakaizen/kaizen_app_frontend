import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { materiaPrimaAPI } from '../services/api';

export default function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    materiaPrimaAPI
      .getAll()
      .then((res) => setMaterials(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lowStock = materials.filter(
    (m) => parseFloat(m.estoque_minimo) > 0 && parseFloat(m.quantidade) <= parseFloat(m.estoque_minimo)
  );

  if (loading) return <div className="loading">A carregar...</div>;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{materials.length}</div>
          <div className="stat-label">Matérias-Primas</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Stock Baixo</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">
            {materials.filter((m) => parseFloat(m.quantidade) > 0).length}
          </div>
          <div className="stat-label">Com Stock</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">
            {materials.filter((m) => parseFloat(m.quantidade) === 0).length}
          </div>
          <div className="stat-label">Sem Stock</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning">
          <h3>Alerta — Stock Abaixo do Mínimo</h3>
          <ul>
            {lowStock.map((m) => (
              <li key={m.id}>
                <strong>{m.descricao}</strong> ({m.largura}×{m.comprimento}×{m.espessura} mm) —
                Stock atual: <strong>{m.quantidade}</strong> | Mínimo: {m.estoque_minimo}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-actions">
        <Link to="/scan" className="btn btn-primary btn-large">
          Scan QR Code
        </Link>
        <Link to="/materias-primas" className="btn btn-secondary btn-large">
          Gerir Matérias-Primas
        </Link>
      </div>

      <h2>Stock Atual</h2>
      {materials.length === 0 ? (
        <div className="empty-state">
          <p>Ainda não há matérias-primas registadas.</p>
          <Link to="/materias-primas" className="btn btn-primary">
            Adicionar Matéria-Prima
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Largura (mm)</th>
                <th>Comprimento (mm)</th>
                <th>Espessura (mm)</th>
                <th>Quantidade</th>
                <th>Mín.</th>
                <th>Máx.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const qty = parseFloat(m.quantidade);
                const min = parseFloat(m.estoque_minimo);
                const max = parseFloat(m.estoque_maximo);
                let status = 'normal';
                let label = 'OK';
                if (qty === 0) { status = 'zero'; label = 'Sem Stock'; }
                else if (min > 0 && qty <= min) { status = 'low'; label = 'Stock Baixo'; }
                else if (max > 0 && qty >= max) { status = 'high'; label = 'Stock Alto'; }

                return (
                  <tr key={m.id}>
                    <td>{m.descricao}</td>
                    <td>{m.largura}</td>
                    <td>{m.comprimento}</td>
                    <td>{m.espessura}</td>
                    <td><strong>{m.quantidade}</strong></td>
                    <td>{m.estoque_minimo}</td>
                    <td>{m.estoque_maximo}</td>
                    <td>
                      <span className={`badge badge-${status}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

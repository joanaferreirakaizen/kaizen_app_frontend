import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { materiaPrimaAPI, stocksAPI } from '../services/api';

const emptyForm = {
  descricao: '',
  largura: '',
  comprimento: '',
  espessura: '',
  estoque_minimo: '',
  estoque_maximo: '',
};

export default function MateriaPrima() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [stockReduzir, setStockReduzir] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    materiaPrimaAPI
      .getAll()
      .then((res) => setMaterials(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await materiaPrimaAPI.update(editing, form);
        setSuccess('Matéria-prima atualizada com sucesso.');
      } else {
        await materiaPrimaAPI.create(form);
        setSuccess('Matéria-prima criada com sucesso.');
      }
      setForm(emptyForm);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao guardar');
    }
  };

  const handleEdit = (m) => {
    setEditing(m.id);
    setForm({
      descricao: m.descricao,
      largura: m.largura,
      comprimento: m.comprimento,
      espessura: m.espessura,
      estoque_minimo: m.estoque_minimo,
      estoque_maximo: m.estoque_maximo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que quer eliminar esta matéria-prima? Todos os movimentos associados serão eliminados.')) return;
    try {
      await materiaPrimaAPI.delete(id);
      setSuccess('Eliminado com sucesso.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao eliminar');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

  const openStockModal = (m) => {
    setStockModal(m);
    setStockQty('');
    setStockReduzir(false);
    setError('');
    setSuccess('');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setStockLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await stocksAPI.create({
        materia_prima_id: stockModal.id,
        quer_reduzir: stockReduzir,
        quantidade: parseFloat(stockQty),
      });
      const acao = stockReduzir ? 'retiradas' : 'adicionadas';
      setSuccess(`${stockQty} unidades ${acao}. Stock atual: ${res.data.quantidade_atual}`);
      setStockModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registar movimento');
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Matérias-Primas</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>{editing ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group form-span-2">
            <label>Descrição *</label>
            <input
              type="text"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Ex: Chapa de Aço Inox"
              required
            />
          </div>
          <div className="form-group">
            <label>Largura (mm) *</label>
            <input
              type="number"
              name="largura"
              value={form.largura}
              onChange={handleChange}
              step="0.001"
              min="0"
              placeholder="0.000"
              required
            />
          </div>
          <div className="form-group">
            <label>Comprimento (mm) *</label>
            <input
              type="number"
              name="comprimento"
              value={form.comprimento}
              onChange={handleChange}
              step="0.001"
              min="0"
              placeholder="0.000"
              required
            />
          </div>
          <div className="form-group">
            <label>Espessura (mm) *</label>
            <input
              type="number"
              name="espessura"
              value={form.espessura}
              onChange={handleChange}
              step="0.001"
              min="0"
              placeholder="0.000"
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Mínimo</label>
            <input
              type="number"
              name="estoque_minimo"
              value={form.estoque_minimo}
              onChange={handleChange}
              step="0.001"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Stock Máximo</label>
            <input
              type="number"
              name="estoque_maximo"
              value={form.estoque_maximo}
              onChange={handleChange}
              step="0.001"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-actions form-span-full">
            <button type="submit" className="btn btn-primary">
              {editing ? 'Atualizar' : 'Criar'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Largura</th>
              <th>Comprimento</th>
              <th>Espessura</th>
              <th>Quantidade</th>
              <th>Mín.</th>
              <th>Máx.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center">A carregar...</td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan={9} className="text-center">Nenhuma matéria-prima registada.</td></tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.descricao}</td>
                  <td>{m.largura}</td>
                  <td>{m.comprimento}</td>
                  <td>{m.espessura}</td>
                  <td><strong>{m.quantidade}</strong></td>
                  <td>{m.estoque_minimo}</td>
                  <td>{m.estoque_maximo}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-success" onClick={() => openStockModal(m)} title="Entrada/Saída de stock">
                        + / −
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => setQrModal(m)} title="Ver QR Code">
                        QR
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEdit(m)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{stockModal.descricao}</h2>
            <p className="qr-dims">{stockModal.largura} × {stockModal.comprimento} × {stockModal.espessura} mm</p>
            <p style={{ marginBottom: '16px' }}>
              Stock atual: <strong>{stockModal.quantidade}</strong>
            </p>
            <form onSubmit={handleStockSubmit}>
              <div className="toggle-group" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`toggle-btn entrada ${!stockReduzir ? 'active' : ''}`}
                  onClick={() => setStockReduzir(false)}
                >
                  + Entrada
                </button>
                <button
                  type="button"
                  className={`toggle-btn saida ${stockReduzir ? 'active' : ''}`}
                  onClick={() => setStockReduzir(true)}
                >
                  − Saída
                </button>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Quantidade *</label>
                <input
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  step="0.001"
                  min="0.001"
                  placeholder="0"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className={`btn ${stockReduzir ? 'btn-danger' : 'btn-success'}`}
                  disabled={stockLoading}
                >
                  {stockLoading ? 'A processar...' : stockReduzir ? '− Registar Saída' : '+ Registar Entrada'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setStockModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{qrModal.descricao}</h2>
            <p className="qr-dims">{qrModal.largura} × {qrModal.comprimento} × {qrModal.espessura} mm</p>
            <div className="qr-container">
              <QRCodeSVG value={String(qrModal.id)} size={220} level="H" />
            </div>
            <p className="qr-id">ID: {qrModal.id}</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => window.print()}>
                Imprimir
              </button>
              <button className="btn btn-secondary" onClick={() => setQrModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { materiaPrimaAPI, stocksAPI } from '../services/api';

export default function ScanQR() {
  const [scanning, setScanning] = useState(false);
  const [material, setMaterial] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [querReduzir, setQuerReduzir] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef(null);

  // Inicializa o scanner quando scanning=true (após React renderizar o div)
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      false
    );

    scanner.render(
      async (decodedText) => {
        const id = parseInt(decodedText, 10);
        if (isNaN(id)) {
          setError('QR Code inválido — não contém um ID de matéria-prima.');
          scanner.clear().catch(() => {});
          setScanning(false);
          return;
        }
        scanner.clear().catch(() => {});
        setScanning(false);
        await loadMaterial(id);
      },
      () => {} // erros de leitura são ignorados (frames sem QR)
    );

    scannerRef.current = scanner;
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  const loadMaterial = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await materiaPrimaAPI.getById(id);
      setMaterial(res.data);
    } catch {
      setError('Matéria-prima não encontrada para este QR Code.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const id = parseInt(manualId, 10);
    if (isNaN(id)) { setError('ID inválido'); return; }
    setManualId('');
    await loadMaterial(id);
  };

  const handleMovimento = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await stocksAPI.create({
        materia_prima_id: material.id,
        quer_reduzir: querReduzir,
        quantidade: parseFloat(quantidade),
      });
      const acao = querReduzir ? 'removidas' : 'adicionadas';
      setSuccess(`${quantidade} unidades ${acao}. Stock atual: ${res.data.quantidade_atual}`);
      setMaterial(res.data.materia_prima);
      setQuantidade('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registar movimento');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMaterial(null);
    setQuantidade('');
    setError('');
    setSuccess('');
    setScanning(false);
  };

  return (
    <div className="page">
      <h1>Scan QR Code</h1>
      <p className="page-description">
        Aponte a câmara para o QR Code da matéria-prima para registar uma entrada ou saída de stock.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!material && !scanning && (
        <div className="scan-start">
          <button className="btn btn-primary btn-large" onClick={() => { setError(''); setSuccess(''); setScanning(true); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7-5-7 5M23 17l-7 5-7-5M1 7l7-5 7 5M1 17l7 5 7-5"/>
            </svg>
            Iniciar Scanner
          </button>

          <div className="divider">ou introduza o ID manualmente</div>

          <form className="manual-form" onSubmit={handleManualSubmit}>
            <input
              type="number"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="ID da matéria-prima"
              min="1"
              required
            />
            <button type="submit" className="btn btn-secondary">
              Carregar
            </button>
          </form>
        </div>
      )}

      {scanning && (
        <div className="scanner-wrap">
          <div id="qr-reader" />
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (scannerRef.current) scannerRef.current.clear().catch(() => {});
              setScanning(false);
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {material && (
        <div className="card material-found">
          <div className="material-found-header">
            <span className="check-icon">✓</span>
            <div>
              <h2>{material.descricao}</h2>
              <p className="dims">{material.largura} × {material.comprimento} × {material.espessura} mm</p>
            </div>
          </div>

          <div className="stock-summary">
            <div className="stock-item">
              <span className="stock-label">Stock Atual</span>
              <span className="stock-value">{material.quantidade}</span>
            </div>
            <div className="stock-item">
              <span className="stock-label">Mínimo</span>
              <span className="stock-value secondary">{material.estoque_minimo}</span>
            </div>
            <div className="stock-item">
              <span className="stock-label">Máximo</span>
              <span className="stock-value secondary">{material.estoque_maximo}</span>
            </div>
          </div>

          <form onSubmit={handleMovimento} className="movimento-form">
            <h3>Registar Movimento</h3>

            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn entrada ${!querReduzir ? 'active' : ''}`}
                onClick={() => setQuerReduzir(false)}
              >
                + Entrada
              </button>
              <button
                type="button"
                className={`toggle-btn saida ${querReduzir ? 'active' : ''}`}
                onClick={() => setQuerReduzir(true)}
              >
                − Saída
              </button>
            </div>

            <div className="form-group">
              <label>Quantidade *</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                step="0.001"
                min="0.001"
                placeholder="0"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`btn btn-large ${querReduzir ? 'btn-danger' : 'btn-success'}`}
                disabled={loading}
              >
                {loading ? 'A processar...' : querReduzir ? '− Registar Saída' : '+ Registar Entrada'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={reset}>
                Novo Scan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

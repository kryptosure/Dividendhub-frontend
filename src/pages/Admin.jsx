import React, { useEffect, useState } from 'react';
import { getMe } from '../services/api';

const Admin = () => {
  const [status, setStatus] = useState('loading');
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await getMe();
        setMe(data);
        setStatus('success');
      } catch (e) {
        setError(e.message || 'Unknown error');
        setStatus('error');
      }
    };
    check();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 ADMIN DIAGNOSTIC PAGE</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #0f0' }}>
        <strong>Page loaded:</strong> ✅ Yes, you're seeing the Admin component render.
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #0f0' }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #0f0' }}>
        <strong>Current URL:</strong> {window.location.href}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #0f0' }}>
        <strong>Token exists:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #0f0' }}>
        <strong>getMe() response:</strong>
        <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(me, null, 2)}
        </pre>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #f00', color: '#f00' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default Admin;
import React, { useEffect } from 'react';
import { generateTestData } from '../utils/testDataGenerator';

export default function SalesDataTester() {
  useEffect(() => {
    console.log('=== INICIANDO TESTE DE DADOS DE VENDAS ===');
    const testData = generateTestData();
    console.log('Dados gerados:', testData);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h3>Teste de Dados</h3>
      <p>Verifique o console para ver os dados gerados</p>
    </div>
  );
}

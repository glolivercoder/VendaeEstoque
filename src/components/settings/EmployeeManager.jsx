import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const EmployeeManager = () => {
  const { users, addUser, updateUser, deleteUser, EMPLOYEE_TYPES, currentUser } = useAuth();
  const employees = users || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    password: '',
    confirmPassword: '',
    type: EMPLOYEE_TYPES.SELLER, // Definindo 'vendedor' como tipo padrão para novos usuários
    username: '', // Novo campo para usuário
    rg: '', // Novo campo para RG
    cpf: '' // Novo campo para CPF
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Função para formatar número de WhatsApp
  const formatWhatsApp = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'whatsapp') {
      setFormData(prev => ({
        ...prev,
        [name]: formatWhatsApp(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      address: '',
      password: '',
      confirmPassword: '',
      type: EMPLOYEE_TYPES.SELLER, // Mantendo 'vendedor' como tipo padrão
      username: '', // Resetando campo de usuário
      rg: '', // Resetando campo de RG
      cpf: '' // Resetando campo de CPF
    });
    setEditingEmployee(null);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  // Função para editar um funcionário
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      whatsapp: employee.whatsapp || '',
      address: employee.address || '',
      password: '',
      confirmPassword: '',
      type: employee.type,
      username: employee.username || '',
      rg: employee.rg || '',
      cpf: employee.cpf || ''
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
  };

  // Função para remover um funcionário
  const handleRemove = (id) => {
    try {
      deleteUser(id);
      setSuccess('Funcionário removido com sucesso');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Função para salvar um funcionário (novo ou editado)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos obrigatórios
    if (!formData.username) {
      setError('Nome de usuário é obrigatório');
      return;
    }

    // Validar formato de e-mail (apenas se for fornecido)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Formato de e-mail inválido');
        return;
      }
    }

    // Validar senha para novo funcionário
    if (!editingEmployee && (!formData.password || formData.password.length < 6)) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Validar confirmação de senha
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Verificar se o e-mail já está em uso (exceto para o funcionário sendo editado)
    const emailExists = employees.some(
      emp => emp.email === formData.email && (!editingEmployee || emp.id !== editingEmployee.id)
    );

    if (emailExists) {
      setError('Este e-mail já está em uso');
      return;
    }

    // Preparar dados para salvar
    const employeeData = {
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      address: formData.address,
      type: formData.type,
      username: formData.username,
      rg: formData.rg,
      cpf: formData.cpf
    };

    // Adicionar senha apenas se for fornecida
    if (formData.password) {
      employeeData.password = formData.password;
    }

    if (editingEmployee) {
      // Atualizar funcionário existente
      updateUser({...editingEmployee, ...employeeData});
      setSuccess('Funcionário atualizado com sucesso');
    } else {
      // Adicionar novo funcionário
      addUser(employeeData);
      setSuccess('Funcionário adicionado com sucesso');
    }

    resetForm();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Funcionários</h3>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-dark"
            title="Adicionar funcionário"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4">
          <h4 className="text-md font-medium mb-3">
            {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuário*
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div>
              <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">
                RG
              </label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                {Object.entries(EMPLOYEE_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {editingEmployee ? 'Nova Senha (opcional)' : 'Senha*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required={!editingEmployee}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required={!editingEmployee || formData.password !== ''}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              {editingEmployee ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.type === EMPLOYEE_TYPES.ADMIN
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {employee.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.whatsapp || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      Editar
                    </button>
                    {/* Não permitir remover o próprio usuário */}
                    {currentUser && currentUser.id !== employee.id && (
                      <button
                        onClick={() => handleRemove(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;

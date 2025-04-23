import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Criando o contexto de autenticação
export const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Tipos de funcionários
export const EMPLOYEE_TYPES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  SELLER: 'vendedor'
};

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  // Estado para armazenar os usuários
  const [users, setUsers] = useLocalStorage('users', []);

  // Estado para armazenar o usuário logado
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

  // Estado para controlar se o modal de login está aberto
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Estado para armazenar erros de autenticação
  const [error, setError] = useState(null);

  // Verificar se já existe um administrador padrão
  useEffect(() => {
    if (users.length === 0) {
      // Criar um administrador padrão se não existir nenhum usuário
      const defaultAdmin = {
        id: '1',
        name: 'Administrador',
        username: 'admin',
        password: 'admin123', // Em produção, usar hash
        type: EMPLOYEE_TYPES.ADMIN,
        permissions: ['dashboard', 'inventory', 'sales', 'clients', 'vendors', 'reports', 'settings'],
        address: 'Rua Exemplo, 123, Salvador-BA',
        cep: '40255-310', // CEP padrão para Salvador-BA
        createdAt: new Date().toISOString()
      };

      setUsers([defaultAdmin]);
    }
  }, [users, setUsers]);

  // Função para adicionar um novo usuário
  const addUser = (userData) => {
    // Verificar se o nome de usuário já existe
    if (users.some(user => user.username === userData.username)) {
      setError('Nome de usuário já existe');
      throw new Error('Nome de usuário já existe');
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    setError(null);
    return newUser;
  };

  // Função para atualizar um usuário
  const updateUser = (updatedData) => {
    const id = updatedData.id;

    // Verificar se o nome de usuário já existe (exceto para o próprio usuário)
    if (updatedData.username && users.some(user => user.username === updatedData.username && user.id !== id)) {
      setError('Nome de usuário já existe');
      throw new Error('Nome de usuário já existe');
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id
          ? {
              ...user,
              ...updatedData,
              // Se a senha estiver vazia, manter a senha atual
              password: updatedData.password || user.password,
              updatedAt: new Date().toISOString()
            }
          : user
      )
    );

    // Se o usuário atualizado for o usuário atual, atualizar também o currentUser
    if (currentUser && currentUser.id === id) {
      const updatedUser = users.find(user => user.id === id);
      if (updatedUser) {
        setCurrentUser({ ...updatedUser, ...updatedData });
      }
    }

    setError(null);
  };

  // Função para remover um usuário
  const deleteUser = (id) => {
    // Não permitir remover o último administrador
    const admins = users.filter(user => user.type === EMPLOYEE_TYPES.ADMIN);
    const userToRemove = users.find(user => user.id === id);

    if (admins.length === 1 && userToRemove && userToRemove.type === EMPLOYEE_TYPES.ADMIN) {
      setError('Não é possível remover o último administrador');
      throw new Error('Não é possível remover o último administrador');
    }

    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

    // Se o usuário removido for o usuário atual, fazer logout
    if (currentUser && currentUser.id === id) {
      logout();
    }

    setError(null);
  };

  // Função para fazer login
  const login = async (username, password) => {
    try {
      const user = users.find(
        user => user.username === username && user.password === password
      );

      if (user) {
        setCurrentUser(user);
        setError(null);
        return user;
      } else {
        setError('Nome de usuário ou senha incorretos');
        throw new Error('Nome de usuário ou senha incorretos');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      throw err;
    }
  };

  // Função para fazer logout
  const logout = () => {
    setCurrentUser(null);
    setError(null);
  };

  // Verificar se o usuário tem permissão para acessar determinada funcionalidade
  const hasPermission = (feature) => {
    if (!currentUser) return false;

    // Administradores têm acesso a todas as funcionalidades
    if (currentUser.type === EMPLOYEE_TYPES.ADMIN) return true;

    // Verificar se o usuário tem a permissão específica
    return currentUser.permissions && currentUser.permissions.includes(feature);
  };

  // Recuperar senha (simulação)
  const recoverPassword = (username) => {
    try {
      const user = users.find(user => user.username === username);
      if (!user) {
        setError('Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }

      // Em um ambiente real, enviaríamos um e-mail com um link para redefinir a senha
      // Aqui, apenas retornamos a senha atual para fins de demonstração
      setError(null);
      return user.password;
    } catch (err) {
      setError(err.message || 'Erro ao recuperar senha');
      throw err;
    }
  };

  // Valor do contexto
  const value = {
    users,
    currentUser,
    showLoginModal,
    setShowLoginModal,
    error,
    setError,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    hasPermission,
    recoverPassword,
    EMPLOYEE_TYPES
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

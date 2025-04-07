import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Vendors from '../pages/Vendors';
import { AppContextProvider } from '../context/AppContext';

// Mock the AppContext
jest.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    vendors: [
      {
        id: 1,
        name: 'Test Vendor',
        description: 'Test Description',
        cnpj: '12.345.678/0001-90',
        email: 'test@example.com',
        whatsapp: '(11) 98765-4321',
        telegram: '(11) 98765-4321',
        instagram: 'testvendor',
        url: 'https://example.com'
      }
    ],
    handleAddVendor: jest.fn(),
    handleUpdateVendor: jest.fn(),
    handleDeleteVendor: jest.fn()
  }),
  AppContextProvider: ({ children }) => <div>{children}</div>
}));

describe('Vendors Component', () => {
  test('renders the vendors page', () => {
    render(<Vendors />);
    
    // Check if the form is rendered
    expect(screen.getByText('Adicionar Fornecedor')).toBeInTheDocument();
    
    // Check if the vendors list is rendered
    expect(screen.getByText('Fornecedores')).toBeInTheDocument();
  });
  
  test('displays vendor information', () => {
    render(<Vendors />);
    
    // Check if the vendor information is displayed
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  test('allows adding a new vendor', async () => {
    const { handleAddVendor } = require('../context/AppContext').useAppContext();
    
    render(<Vendors />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Vendor' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText('CNPJ'), { target: { value: '12.345.678/0001-90' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Adicionar'));
    
    // Check if handleAddVendor was called
    await waitFor(() => {
      expect(handleAddVendor).toHaveBeenCalled();
    });
  });
  
  test('allows editing a vendor', async () => {
    const { handleUpdateVendor } = require('../context/AppContext').useAppContext();
    
    render(<Vendors />);
    
    // Click the edit button
    fireEvent.click(screen.getAllByRole('button')[0]);
    
    // Check if the form is in edit mode
    expect(screen.getByText('Editar Fornecedor')).toBeInTheDocument();
    
    // Update the form
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Updated Vendor' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Atualizar'));
    
    // Check if handleUpdateVendor was called
    await waitFor(() => {
      expect(handleUpdateVendor).toHaveBeenCalled();
    });
  });
  
  test('allows deleting a vendor', async () => {
    const { handleDeleteVendor } = require('../context/AppContext').useAppContext();
    
    render(<Vendors />);
    
    // Click the delete button
    fireEvent.click(screen.getAllByRole('button')[1]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Excluir'));
    
    // Check if handleDeleteVendor was called
    await waitFor(() => {
      expect(handleDeleteVendor).toHaveBeenCalled();
    });
  });
});

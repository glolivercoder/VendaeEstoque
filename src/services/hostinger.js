import axios from 'axios';

const {
  VITE_HOSTINGER_API_URL: API_URL,
  VITE_HOSTINGER_API_KEY: API_KEY,
  VITE_HOSTINGER_SITE_ID: SITE_ID
} = import.meta.env;

const hostingerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  }
});

export const syncProductsToHostinger = async (products) => {
  try {
    const response = await hostingerApi.post(`/sites/${SITE_ID}/products`, {
      products: products.map(product => ({
        name: product.description,
        price: parseFloat(product.price),
        description: product.description,
        image_url: product.image,
        stock: product.quantity,
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing products to Hostinger:', error);
    throw error;
  }
};

export const configureHostingerApp = async (config) => {
  try {
    const response = await hostingerApi.post(`/sites/${SITE_ID}/config`, config);
    return response.data;
  } catch (error) {
    console.error('Error configuring Hostinger app:', error);
    throw error;
  }
}; 
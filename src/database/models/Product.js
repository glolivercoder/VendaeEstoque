const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mediaType: {
      type: DataTypes.STRING,
      defaultValue: 'image'
    },
    additionalImages: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('additionalImages');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('additionalImages', JSON.stringify(value || []));
      }
    },
    additionalMediaTypes: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('additionalMediaTypes');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('additionalMediaTypes', JSON.stringify(value || []));
      }
    },
    itemDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Todos'
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gtin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ncm: {
      type: DataTypes.STRING,
      allowNull: true
    },
    links: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('links');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('links', JSON.stringify(value || []));
      }
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  return Product;
};

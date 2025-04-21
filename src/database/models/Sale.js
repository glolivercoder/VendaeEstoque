const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientDocument: {
      type: DataTypes.STRING,
      allowNull: true
    },
    formattedDate: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.date) return '';
        const date = new Date(this.date);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
    }
  });

  return Sale;
};

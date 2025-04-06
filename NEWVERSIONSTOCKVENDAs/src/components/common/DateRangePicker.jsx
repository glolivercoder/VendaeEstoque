import React from 'react';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  // Função para formatar a data para o formato aceito pelo input date (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  };
  
  // Função para converter a data do formato do input para objeto Date
  const handleStartDateChange = (event) => {
    const date = event.target.value ? new Date(event.target.value) : new Date();
    onStartDateChange(date);
  };
  
  const handleEndDateChange = (event) => {
    const date = event.target.value ? new Date(event.target.value) : new Date();
    onEndDateChange(date);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-2 p-3 bg-light-background dark:bg-dark-background rounded-md">
      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
          De:
        </label>
        <input
          id="start-date"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          className="form-input py-1 px-2 text-sm"
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
          Até:
        </label>
        <input
          id="end-date"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          min={formatDateForInput(startDate)}
          className="form-input py-1 px-2 text-sm"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
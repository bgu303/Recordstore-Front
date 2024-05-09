import React, { useRef, useCallback } from 'react';
import { useGridFilter } from '@ag-grid-community/react';

const Sizefilter = ({ model, onModelChange, getValue }) => {
  const refSelect = useRef(null);

  // Function to handle filter change
  const handleFilterChange = (event) => {
    const value = event.target.value;
    onModelChange(value === '' ? null : value);
  };

  const doesFilterPass = useCallback(p => {
    console.log(p)
  }, [model])

  useGridFilter({doesFilterPass})

  return (
    <div className="custom-filter">
      <select
        ref={refSelect}
        value={model || ''}
        onChange={handleFilterChange}
      >
        <option value="">Kaikki</option>
        <option value='7"'>7"</option>
        <option value='10"'>10"</option>
        <option value='12"'>12"</option>
        <option value="MLP">MLP</option>
        <option value="LP">LP</option>
        <option value="CD">CD</option>
        <option value="CDs">CDs</option>
        <option value="MAG">MAG</option>
        <option value="DVD">DVD</option>
        <option value="BOO">BOO</option>
      </select>
    </div>
  );
};

export default Sizefilter;

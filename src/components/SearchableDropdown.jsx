import { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/20/solid';

function SearchableDropdown({ 
  items = [], 
  value = null, 
  onChange, 
  onSearch, 
  onAdd = null,
  placeholder = ''
}) {
  const [query, setQuery] = useState('');

  const filteredItems = query === '' ? items : items.filter((item) =>
    item?.name?.toLowerCase().includes(query.toLowerCase()) ||
    item?.document?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <div className="flex items-center">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border focus-within:border-blue-500">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={(item) => item?.name || ''}
                onChange={(event) => {
                  setQuery(event.target.value);
                  onSearch(event.target.value);
                }}
                placeholder={placeholder}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="ml-2 p-2 text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredItems.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nada encontrado.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Combobox.Option
                    key={item.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {item.name} - {item.document}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}

SearchableDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired,
      document: PropTypes.string.isRequired
    })
  ).isRequired,
  value: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    document: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  placeholder: PropTypes.string
};

export default SearchableDropdown; 
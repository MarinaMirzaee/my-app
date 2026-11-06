import { useEffect, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

function SearchFilter({
  value,
  onSearchChange,
  placeholder,
  resultCount,
  totalCount,
}) {
  const [input, setInput] = useState(value);
  const debouncedInput = useDebouncedValue(input, 300);

  useEffect(() => {
    onSearchChange(debouncedInput);
  }, [debouncedInput, onSearchChange]);

  return (
    <div className="mb-4 flex w-full max-w-xl flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="list-search">
        Search all fields
      </label>
      <input
        id="list-search"
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 sm:flex-1"
      />
      <span className="text-sm text-gray-500" aria-live="polite">
        Showing {resultCount} of {totalCount}
      </span>
    </div>
  );
}

export default SearchFilter;
export function InputBox({ id, label, placeholder, value, onChange, type = "text", autoComplete, minLength, maxLength, required = true }) {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}       
          onChange={onChange} 
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
        />
      </div>
    );
  }

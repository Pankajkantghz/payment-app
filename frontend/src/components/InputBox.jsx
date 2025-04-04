export function InputBox({ label, placeholder, value, onChange }) {
    return (
      <div>
        <div className="text-sm font-medium text-left py-2">
          {label}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}       
          onChange={onChange} 
          className="w-full px-2 py-1 border rounded border-slate-200"
        />
      </div>
    );
  }
  
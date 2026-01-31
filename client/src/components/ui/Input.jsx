export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    {label} {required && <span className="text-accent-violet">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`
          w-full px-4 py-3 rounded-xl
          bg-dark-700 border border-dark-600
          text-white placeholder-gray-500
          focus:outline-none focus:border-accent-violet focus:ring-2 focus:ring-accent-violet/50
          transition-all duration-300
          ${error ? 'border-red-500' : ''}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

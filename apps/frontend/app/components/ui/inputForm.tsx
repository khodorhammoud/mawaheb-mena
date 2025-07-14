function InputForm({ name, label, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        id={name}
        name={name}
        placeholder=" "
        {...props}
        className={`peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 focus:ring-primaryColor focus:border-primaryColor text-lg ${className}`}
      />
      <label
        htmlFor={name}
        className="absolute left-4 top-3 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-1/2 peer-focus:top-1 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
      >
        {label}
      </label>
    </div>
  );
}

export default InputForm;

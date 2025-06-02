export default function Input({ name, label = null, fullwidth = false, ...props }) {
  return (
    <div className={`${fullwidth ? "w-full" : ""}`}>
      {label && <label htmlFor={name} className="block mb-0 text-sm font-medium text-gray-900">
        {label}
      </label>}
      <input
        id={name}
        className={`
          bg-gray-50 border border-gray-300 text-gray-900 
          text-sm rounded-full focus:ring-purple-500 focus:outline-purple-500
          caret-purple-300 
          
          block w-full p-2.5
          `}
        {...props}
      />
    </div>
  )
}

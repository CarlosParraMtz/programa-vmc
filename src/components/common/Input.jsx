export default function Input({
  name,
  label = null,
  ...props
}) {

  const inputProps = { ...props }
  delete inputProps.name
  delete inputProps.label

  return (
    <div>
      {label && <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>}
      <input
        id={name}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        {...props}
      />
    </div>
  )
}

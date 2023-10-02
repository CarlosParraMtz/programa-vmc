export default function Input({name, label = null, placeholder = null, type = 'text', required = false  }) {
  return (
    <div>
            {label && <label htmlFor={ name } class="block mb-2 text-sm font-medium text-gray-900">
                { label }
            </label>}
            <input 
                type={ type }
                id={ name }
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder={ placeholder } 
                required={ required }
            />
    </div>
  )
}

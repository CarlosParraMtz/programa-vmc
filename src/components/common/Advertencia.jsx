export default function Advertencia({text}) {
  return (
    <div role="alert" className="app-warning flex items-center justify-between bg-red-100 border border-red-500 rounded-xl p-3 mb-3" >
      <span className="flex-1" >
        {text}
      </span>
    </div>
  )
}

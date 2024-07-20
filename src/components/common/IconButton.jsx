export default function IconButton({ children, ...btnProps }) {
    return (
        <button
            type="button"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-300"
            {...btnProps}
        >
            {children}
        </button>
    )
}

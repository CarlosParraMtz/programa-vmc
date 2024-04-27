import toast from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

const success = (text) => toast.success(text, { id: uuid() })
const error = (text) => toast.error(text, { id: uuid() })
const info = (text) => {
    return toast(text, { icon: '⚠️', id: uuid() })
}

export default {
    success, error, info
}
import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, InputProps } from './Input'

export function PasswordInput(props: InputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute bottom-1.5 right-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

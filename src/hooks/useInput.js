import { useCallback, useState } from 'react'

/** Hook state input form: [value, onChange, setValue, reset]. */
export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = useCallback((e) => setValue(e.target.value), [])
  const reset = useCallback(() => setValue(initial), [initial])
  return [value, onChange, setValue, reset]
}

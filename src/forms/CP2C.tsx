import type { FormProps } from './types'
import CP2Base from './CP2Base'

export default function CP2C(props: FormProps) {
  return <CP2Base variant="C" {...props} />
}

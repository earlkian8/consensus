import { sileo, Toaster } from "sileo"
import "sileo/styles.css"

export { sileo, Toaster }

export function SileoToastProvider({ position = "top-center", ...props }) {
  return <Toaster position={position} theme="dark" {...props} />
}

export default function SileoToast({
  type = "success",
  title,
  description,
  duration,
  position,
  icon,
  button,
  fill,
  roundness,
  autopilot,
  styles,
}) {
  const options = {
    ...(title && { title }),
    ...(description && { description }),
    ...(duration && { duration }),
    ...(position && { position }),
    ...(icon && { icon }),
    ...(button && { button }),
    ...(fill && { fill }),
    ...(roundness && { roundness }),
    ...(autopilot !== undefined && { autopilot }),
    ...(styles && { styles }),
  }

  return {
    fire: () => sileo[type](options),
    options,
  }
}

export function fireToast(type = "success", options = {}) {
  return sileo[type](options)
}

export function firePromiseToast(promise, options = {}) {
  return sileo.promise(promise, options)
}

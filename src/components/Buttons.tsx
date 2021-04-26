import * as React from "react"
import { Button, Tooltip, IconButton, ButtonProps } from "@material-ui/core"
import { Add } from "@material-ui/icons"

// TODO - PAB shouldn't allow you to provide variant or color so it's more
// obvious how it works.
// Primary Action Button
export const PAB: typeof Button = ({ ...props }) => {
  return <Button {...props} variant="contained" color="primary" />
}

// Secondary Action Button
interface SABProps extends ButtonProps {
  add?: true | undefined
  small?: true | undefined
}
export const SAB: React.FC<SABProps> = ({ add, small, ...props }) => {
  return (
    <Button
      startIcon={add ? <Add /> : null}
      {...props}
      size={small ? "small" : props.size}
      variant="outlined"
      color="secondary"
    />
  )
}

interface PlainButtonProps extends ButtonProps {
  add?: true | undefined
  small?: true | undefined
}

export const PlainButton: React.FC<PlainButtonProps> = ({
  add,
  small,
  ...props
}) => {
  return (
    <Button
      startIcon={add ? <Add /> : null}
      {...props}
      size={small ? "small" : props.size}
      variant="outlined"
    />
  )
}

export const TooltipIconButton: React.FC<{
  tooltip: string
  size?: "small" | "medium"
  className?: string
  disabled?: boolean
  onClick?: () => void
}> = ({ tooltip, children, onClick, className, disabled, size = "small" }) => {
  if (disabled) {
    return (
      <IconButton
        onClick={onClick}
        size={size}
        disabled={disabled}
        className={className}
      >
        {children}
      </IconButton>
    )
  }
  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={onClick} size={size} className={className}>
        {children}
      </IconButton>
    </Tooltip>
  )
}

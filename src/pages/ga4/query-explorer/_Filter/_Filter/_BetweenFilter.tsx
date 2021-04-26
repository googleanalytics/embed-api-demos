import * as React from "react"
import { UpdateFilterFn, ExpressionPath } from "../_index"
import { useStyles } from "./_index"
import TextField from "@material-ui/core/TextField"
import { toNumericValue, numericValueEquals } from "./_NumericFilter"

type BFilter = gapi.client.analyticsdata.BetweenFilter

interface BetweenFilterProps {
  updateFilter: UpdateFilterFn
  path: ExpressionPath
  betweenFilter: BFilter
}

const BetweenFilter: React.FC<BetweenFilterProps> = ({
  updateFilter,
  path,
  betweenFilter,
}) => {
  const classes = useStyles()

  const updateBFilter = React.useCallback(
    (p: "fromValue" | "toValue", nu: string) => {
      const nuVal = toNumericValue(nu)
      if (numericValueEquals(nuVal, betweenFilter[p])) {
        return
      }
      updateFilter(path.concat(["betweenFilter"]), old => ({
        ...old,
        [p]: nuVal,
      }))
    },
    [path, updateFilter, betweenFilter]
  )

  return (
    <>
      <TextField
        className={classes.shortWidth}
        size="small"
        variant="outlined"
        label={"From"}
        onChange={e => {
          const val = e.target.value
          updateBFilter("fromValue", val)
        }}
        value={
          betweenFilter.fromValue?.int64Value ||
          betweenFilter.fromValue?.doubleValue ||
          ""
        }
      />
      <TextField
        className={classes.shortWidth}
        size="small"
        variant="outlined"
        label={"To"}
        onChange={e => {
          const val = e.target.value
          updateBFilter("toValue", val)
        }}
        value={
          betweenFilter.toValue?.int64Value ||
          betweenFilter.toValue?.doubleValue ||
          ""
        }
      />
    </>
  )
}

export default BetweenFilter
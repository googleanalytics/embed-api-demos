import * as React from "react"
import { TextField, makeStyles, Typography } from "@material-ui/core"
import { TooltipIconButton, SAB } from "../../../components/Buttons"
import { Delete, Add } from "@material-ui/icons"
import { Dispatch } from "../../../types"
import InlineCode from "../../../components/InlineCode"
import clsx from "classnames"
import uuid from "uuid/v4"

export interface DateRange {
  name?: string
  id: string
  from: string
  to: string
}

type UseDateRanges = (arg: {
  setDateRanges: Dispatch<DateRange[] | undefined>
}) => {
  addDateRange: () => void
  removeDateRange: (id: string) => void
  updateFrom: (id: string, newFrom: string) => void
  updateTo: (id: string, newTo: string) => void
  updateName: (id: string, newName: string) => void
}
const useDateRanges: UseDateRanges = ({ setDateRanges }) => {
  const addDateRange = React.useCallback(() => {
    setDateRanges((old = []) => {
      return old.concat([
        {
          from: "",
          to: "",
          id: uuid(),
        },
      ])
    })
  }, [setDateRanges])

  const removeDateRange = React.useCallback(
    (id: string) => {
      setDateRanges((old = []) => old.filter(dateRange => dateRange.id !== id))
    },
    [setDateRanges]
  )

  const updateFrom = React.useCallback(
    (id: string, newValue: string) => {
      setDateRanges((old = []) =>
        old.map(dateRange =>
          dateRange.id !== id ? dateRange : { ...dateRange, from: newValue }
        )
      )
    },
    [setDateRanges]
  )

  const updateTo = React.useCallback(
    (id: string, newValue: string) => {
      setDateRanges((old = []) =>
        old.map(dateRange =>
          dateRange.id !== id ? dateRange : { ...dateRange, to: newValue }
        )
      )
    },
    [setDateRanges]
  )

  const updateName = React.useCallback(
    (id: string, newValue: string) => {
      setDateRanges((old = []) =>
        old.map(dateRange =>
          dateRange.id !== id ? dateRange : { ...dateRange, name: newValue }
        )
      )
    },
    [setDateRanges]
  )

  return { addDateRange, removeDateRange, updateFrom, updateTo, updateName }
}

const useStyles = makeStyles(theme => ({
  heading: {
    margin: theme.spacing(1, 0),
    marginTop: theme.spacing(0),
  },
  pabContainer: {
    display: "flex",
    marginBottom: theme.spacing(1),
  },
  dateRanges: {
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(1),
  },
  dateRange: {
    // marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
    display: "flex",
  },
  name: {
    width: "45ch",
  },
  from: {
    marginRight: theme.spacing(1),
  },
  add: {
    alignSelf: "flex-end",
  },
}))

const dateRange = (
  <a href="https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/DateRange">
    DateRange
  </a>
)

const DateRanges: React.FC<{
  dateRanges: DateRange[] | undefined
  setDateRanges: Dispatch<DateRange[] | undefined>
  className?: string
}> = ({ dateRanges, setDateRanges, className }) => {
  const classes = useStyles()
  const {
    addDateRange,
    removeDateRange,
    updateFrom,
    updateTo,
    updateName,
  } = useDateRanges({ setDateRanges })

  return (
    <section className={clsx(classes.dateRanges, className)}>
      <Typography variant="subtitle2" className={classes.heading}>
        date ranges
      </Typography>
      {dateRanges?.map(dateRange => (
        <section key={dateRange.id} className={classes.dateRange}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="name"
            value={dateRange.name}
            className={clsx(classes.from, classes.name)}
            onChange={e => {
              updateName(dateRange.id, e.target.value)
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="start date"
            className={classes.from}
            value={dateRange.from}
            onChange={e => {
              updateFrom(dateRange.id, e.target.value)
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="end date"
            value={dateRange.to}
            onChange={e => {
              updateTo(dateRange.id, e.target.value)
            }}
          />
          <TooltipIconButton
            tooltip="remove daterange"
            onClick={() => removeDateRange(dateRange.id)}
            disabled={dateRanges.length === 1}
          >
            <Delete />
          </TooltipIconButton>
        </section>
      ))}

      <section className={classes.pabContainer}>
        <Typography variant="caption" color="textSecondary">
          The date ranges to use for the request. Format should be either{" "}
          <InlineCode>YYYY-MM-DD</InlineCode>,{" "}
          <InlineCode>yesterday</InlineCode>, <InlineCode>today</InlineCode>, or{" "}
          <InlineCode>NdaysAgo</InlineCode> where N is a positive integer. See{" "}
          {dateRange} on devsite.
        </Typography>
        <SAB
          className={classes.add}
          size="medium"
          onClick={addDateRange}
          startIcon={<Add />}
        >
          Add
        </SAB>
      </section>
    </section>
  )
}

export default DateRanges

// Copyright 2019 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from "react"
import { groupBy, map, sortBy } from "lodash"
import { Set } from "immutable"
import { navigate } from "gatsby"

import { CubesByColumn } from "./_cubes"

import Accordian from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"

import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { RemoveCircle, AddCircle, Info } from "@material-ui/icons"

import { Typography, makeStyles, IconButton } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import { Column } from "../../api"
import classnames from "classnames"
import { CopyIconButton } from "../../components/CopyButton"

const useStyles = makeStyles(theme => ({
  accordionTitle: { margin: 0 },
  expandContract: {
    margin: theme.spacing(1),
  },
  column: {
    display: "flex",
    alignItems: "baseline",
  },
  columnSubgroupTitle: {
    margin: 0,
    marginBottom: theme.spacing(1),
  },
  columnSubgroup: {
    marginBottom: theme.spacing(1),
  },
  deprecatedColumn: {
    textDecoration: "line-through",
  },
  deprecatedCheckbox: {
    visibility: "hidden",
  },
  columnDetails: {
    display: "flex",
    flexDirection: "column",
  },
  columnLabel: {
    display: "flex",
    alignItems: "flex-start",
    flexWrap: "wrap",
    position: "relative",
    top: theme.spacing(-1),
  },
  columnButton: {
    padding: "unset",
    paddingLeft: theme.spacing(1),
  },
  name: { marginRight: theme.spacing(1) },
  id: {},
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
  },
  labelText: {},
}))

type ColumnLabelProps = {
  column: Column
  isDeprecated: boolean
}
const ColumnLabel: React.FC<ColumnLabelProps> = ({ column, isDeprecated }) => {
  const classes = useStyles()
  const slug = `/dimensions-metrics-explorer/${
    column.attributes?.group.replace(/ /g, "-").toLowerCase() || ""
  }#${column.id?.replace("ga:", "")}`

  return (
    <div
      className={classnames(classes.columnLabel, {
        [classes.deprecatedColumn]: isDeprecated,
      })}
    >
      <div className={classes.labelText}>
        <Typography component="div" className={classes.name}>
          {column.attributes?.uiName}
        </Typography>
        <Typography
          color="primary"
          component="div"
          variant="body2"
          className={classes.id}
        >
          {column.id}
          <CopyIconButton toCopy={column.id || ""} />
        </Typography>
      </div>
      <IconButton
        onClick={() => navigate(slug)}
        className={classes.columnButton}
      >
        <Info />
      </IconButton>
    </div>
  )
}

const SelectableColumn: React.FC<{
  column: Column
  selected: boolean
  disabled: boolean
  setSelected: (selected: boolean) => void
}> = ({ column, selected, disabled, setSelected }) => {
  const classes = useStyles()
  const isDeprecated = React.useMemo(
    () => column.attributes?.status !== "PUBLIC",
    [column.attributes]
  )
  return (
    <FormControlLabel
      className={classes.column}
      control={
        <Checkbox
          className={classnames({ [classes.deprecatedCheckbox]: isDeprecated })}
          checked={selected}
          disabled={disabled}
          onChange={event => setSelected(event.target.checked)}
        />
      }
      label={<ColumnLabel column={column} isDeprecated={isDeprecated} />}
    />
  )
}

const ColumnSubgroup: React.FC<{
  columns: Column[]
  name: "Dimensions" | "Metrics"
  allowableCubes: Set<string>
  allowDeprecated: boolean
  onlySegments: boolean
  cubesByColumn: CubesByColumn
  selectedColumns: Set<string>
  selectColumn: (column: string, selected: boolean) => void
}> = ({
  columns,
  name,
  selectColumn,
  selectedColumns,
  allowableCubes,
  allowDeprecated,
  onlySegments,
  cubesByColumn,
}) => {
  const classes = useStyles()
  // Move deprecated columns to the bottom
  const sortedColumns = React.useMemo(
    () =>
      sortBy(columns, column =>
        column.attributes?.status === "PUBLIC" ? 0 : 1
      )
        .filter(
          column =>
            (allowDeprecated && column.attributes?.status !== "PUBLIC") ||
            column.attributes?.status === "PUBLIC"
        )
        .filter(column => {
          if (onlySegments) {
            return column.attributes?.allowedInSegments === "true"
          } else {
            return true
          }
        }),
    [columns, allowDeprecated, onlySegments]
  )

  return (
    <div className={classes.columnSubgroup}>
      <Typography variant="h4" className={classes.columnSubgroupTitle}>
        {name}
      </Typography>
      <div>
        {sortedColumns.length === 0 ? (
          <>No {name}.</>
        ) : (
          sortedColumns.map(column => {
            const disabled =
              allowableCubes.intersect(cubesByColumn.get(column.id!, Set()))
                .size === 0
            return (
              <SelectableColumn
                column={column}
                key={column.id}
                setSelected={selected => selectColumn(column.id!, selected)}
                disabled={disabled}
                selected={selectedColumns.contains(column.id!)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

const ColumnGroup: React.FC<{
  open: boolean
  toggleOpen: () => void
  name: string
  columns: Column[]
  onlySegments: boolean
  allowDeprecated: boolean
  allowableCubes: Set<string>
  cubesByColumn: CubesByColumn
  selectedColumns: Set<string>
  selectColumn: (column: string, selected: boolean) => void
}> = ({
  open,
  toggleOpen,
  name,
  allowDeprecated,
  onlySegments,
  columns,
  allowableCubes,
  cubesByColumn,
  selectedColumns,
  selectColumn,
}) => {
  const classes = useStyles()
  return (
    <Accordian expanded={open} onChange={toggleOpen}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h3" className={classes.accordionTitle}>
          {name}{" "}
          {open && (
            <a
              href={`/dimensions-metrics-explorer/${name
                .toLowerCase()
                .replace(" ", "-")}#${name.replace(" ", "-")}`}
            >
              <LinkIcon />
            </a>
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.columnDetails}>
        <ColumnSubgroup
          name="Dimensions"
          columns={columns.filter(
            column => column.attributes?.type === "DIMENSION"
          )}
          allowableCubes={allowableCubes}
          allowDeprecated={allowDeprecated}
          onlySegments={onlySegments}
          cubesByColumn={cubesByColumn}
          selectColumn={selectColumn}
          selectedColumns={selectedColumns}
        />
        <ColumnSubgroup
          name="Metrics"
          columns={columns.filter(
            column => column.attributes?.type === "METRIC"
          )}
          allowableCubes={allowableCubes}
          allowDeprecated={allowDeprecated}
          onlySegments={onlySegments}
          cubesByColumn={cubesByColumn}
          selectColumn={selectColumn}
          selectedColumns={selectedColumns}
        />
      </AccordionDetails>
    </Accordian>
  )
}

const ColumnGroupList: React.FC<{
  allowDeprecated: boolean
  searchTerms: string[]
  onlySegments: boolean
  cubesByColumn: CubesByColumn
  allCubes: Set<string>
  columns: Column[]
}> = ({
  allowDeprecated,
  searchTerms,
  onlySegments,
  columns,
  cubesByColumn,
  allCubes,
}) => {
  const classes = useStyles()

  // Group all the columns by group
  const groupedColumns = React.useMemo(() =>
    // JS Sets guarantee insertion order is preserved, which is important
    // because the key order in this groupBy determines the order that
    // they appear in the UI.
    {
      return groupBy(columns, column => column.attributes?.group)
    }, [columns])

  // Set of column groups that are currently expanded.
  const [open, setOpen] = React.useState<Set<string>>(() => {
    return Set()
  })

  // Expand/Collapse callbacks
  const toggleGroupOpen = React.useCallback(
    (group: string) =>
      setOpen(oldOpen =>
        oldOpen.contains(group) ? oldOpen.remove(group) : oldOpen.add(group)
      ),
    [setOpen]
  )

  const collapseAll = React.useCallback(() => setOpen(Set()), [setOpen])

  const expandAll = React.useCallback(
    () => setOpen(Set.fromKeys(groupedColumns)),
    [setOpen, groupedColumns]
  )

  // When a search term is entered, auto-expand all groups. When the search
  // terms are cleared, auto-collapse all groups.
  React.useEffect(() => {
    if (searchTerms.length === 0) {
      collapseAll()
    } else {
      expandAll()
    }
  }, [searchTerms.length, collapseAll, expandAll])

  // selectedColumns is the set of selected columns Each column is
  // associated with one or more "cubes", and a only columns that share
  // cubes may be mutually selected.
  const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(
    () => Set()
  )

  const selectColumn = React.useCallback(
    (column: string, selected: boolean) =>
      setSelectedColumns(oldSelected =>
        selected ? oldSelected.add(column) : oldSelected.remove(column)
      ),
    [setSelectedColumns]
  )

  // The set of allowable cubes. When any columns are selected, the set of
  // allowable cubes is the intersection of the cubes for those columns
  const allowableCubes = React.useMemo<Set<string>>(
    () =>
      selectedColumns
        .map(columnId => cubesByColumn.get(columnId) || (Set() as Set<string>))
        .reduce((cubes1, cubes2) => cubes1.intersect(cubes2), allCubes),
    [selectedColumns, cubesByColumn, allCubes]
  )

  const showExpandAll = open.size < Object.keys(groupedColumns).length
  const showCollapseAll = open.size > 0
  return (
    <div>
      <div>
        {showExpandAll ? (
          <Button
            variant="outlined"
            className={classes.expandContract}
            endIcon={<AddCircle />}
            onClick={expandAll}
          >
            Expand All
          </Button>
        ) : null}
        {showCollapseAll ? (
          <Button
            variant="outlined"
            className={classes.expandContract}
            endIcon={<RemoveCircle />}
            onClick={collapseAll}
          >
            Hide All
          </Button>
        ) : null}
      </div>
      <div>
        {map(groupedColumns, (columns, groupName) => (
          <ColumnGroup
            open={open.contains(groupName)}
            onlySegments={onlySegments}
            allowDeprecated={allowDeprecated}
            columns={columns}
            name={groupName}
            key={groupName}
            toggleOpen={() => toggleGroupOpen(groupName)}
            allowableCubes={allowableCubes}
            cubesByColumn={cubesByColumn}
            selectedColumns={selectedColumns}
            selectColumn={selectColumn}
          />
        ))}
      </div>
    </div>
  )
}

export default ColumnGroupList

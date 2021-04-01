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

import { useLocalStorage, useTypedLocalStorage } from "../../hooks"
import { Column, useApi } from "../../api"

import TextField from "@material-ui/core/TextField"
import IconButton from "@material-ui/core/IconButton"
import Clear from "@material-ui/icons/Clear"
import ColumnGroupList from "./_ColumnGroupList"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"
import { useDebounce } from "use-debounce/lib"

const useColumns = (): Column[] => {
  const api = useApi()
  const [columns, setColumns] = useTypedLocalStorage<Column[]>(
    "metadata.columns",
    [],
    false
  )

  React.useEffect(() => {
    if (api === undefined) {
      return
    }

    api.metadata.columns.list({ reportType: "ga" }).then(response => {
      const nu = response.result.items!
      // Since changing the columns will cause an expensive re-render, only
      // update them if the API has a result different from the one that was
      // in localStorage.
      setColumns(old => (JSON.stringify(old) === JSON.stringify(nu) ? old : nu))
    })
  }, [api, setColumns])
  return columns
}

const Main: React.FC = () => {
  const [searchText, setSearchText] = useLocalStorage("searchText", "")
  const [allowDeprecated, setAllowDeprecated] = useTypedLocalStorage(
    "allowDeprecated",
    false
  )
  const [onlySegments, setOnlySegments] = useTypedLocalStorage(
    "onlySegments",
    false
  )

  const searchTerms = React.useMemo(
    () =>
      searchText
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0),
    [searchText]
  )

  const [throttledSearch] = useDebounce(searchTerms, 100, { trailing: true })

  const columns = useColumns()

  return (
    <div>
      <TextField
        placeholder="Search"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={() => setSearchText("")}>
              <Clear />
            </IconButton>
          ),
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={onlySegments}
            onChange={e => setOnlySegments(e.target.checked)}
          />
        }
        label="Only show fields that are allowed in segments"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={allowDeprecated}
            onChange={e => setAllowDeprecated(e.target.checked)}
          />
        }
        label="Include deprecated fields"
      />
      {columns.length !== 0 ? (
        <ColumnGroupList
          searchTerms={throttledSearch}
          allowDeprecated={allowDeprecated}
          onlySegments={onlySegments}
          columns={columns}
        />
      ) : (
        <div>Loading dimensions and metrics...</div>
      )}
    </div>
  )
}

export default Main

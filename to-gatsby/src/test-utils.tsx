// Copyright 2020 Google Inc. All rights reserved.
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
import { Provider } from "react-redux"
import { makeStore } from "../gatsby/wrapRootElement"
import {
  createHistory,
  createMemorySource,
  LocationProvider,
  History,
} from "@reach/router"
import { AccountSummary } from "./api"

interface WithProvidersConfig {
  path: string
  measurementID?: string
}

export const withProviders = (
  component: JSX.Element | null,
  { measurementID, path }: WithProvidersConfig = { path: "/" }
): {
  wrapped: JSX.Element
  history: History
  store: any
} => {
  const history = createHistory(createMemorySource(path))
  if (measurementID) {
    process.env.GATSBY_GA_MEASUREMENT_ID = measurementID
  }
  const store = makeStore()
  const wrapped = (
    <Provider store={store}>
      <LocationProvider history={history}>{component}</LocationProvider>
    </Provider>
  )
  return { wrapped, history, store }
}

const testAccounts: AccountSummary[] = [
  {
    id: "account-id-1",
    name: "Account Name 1",
    webProperties: [
      {
        id: "property-id-1-1",
        name: "Property Name 1 1",
        profiles: [
          { id: "view-id-1-1-1", name: "View Name 1 1 1" },
          { id: "view-id-1-1-2", name: "View Name 1 1 2" },
        ],
      },
      {
        id: "property-id-1-2",
        name: "Property Name 1 2",
        profiles: [{ id: "view-id-1-2-1", name: "View Name 1 2 1" }],
      },
    ],
  },
  {
    id: "account-id-2",
    name: "Account Name 2",
    webProperties: [
      {
        id: "property-id-2-1",
        name: "Property Name 2 1",
        profiles: [{ id: "view-id-2-1-1", name: "View Name 2 1 1" }],
      },
    ],
  },
]

const listPromise = Promise.resolve({ result: { items: testAccounts } })
export const testGapi = () => ({
  client: {
    analytics: {
      management: { accountSummaries: { list: () => listPromise } },
    },
  },
})

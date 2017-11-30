/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
const { createElement } = require("react");
const { Provider } = require("react-redux");
const { applyMiddleware, createStore } = require("redux");
const {thunk} = require("../shared/redux/middleware/thunk");
const ObjectInspector = require("./ObjectInspector");
const createReducer = require("./reducer");

// function clearState(
//   id?: String,
//   {
//     releaseActor
//   }
// ) {
//   if (!id) {
//     Object.keys(store).forEach(clearState);
//     store = {};
//     return;
//   }

//   const data = store[id];
//   if (!data) {
//     return;
//   }

//   if (typeof releaseActor === "function") {
//     const {actors} = data;
//     for (let actor of actors) {
//       releaseActor(actor);
//     }
//   }

//   store = Object.entries(store).reduce((obj, [treeId, treeState]) => {
//     if (treeId !== id) {
//       obj[treeId] = treeState;
//     }
//     return obj;
//   }, {});
// }

const persistedStates = new Map();

import type {
  Props,
  State,
} from "./types";

function createInitialState(overrides : Object) : State {
  return Object.assign({
    actors: new Set(),
    expandedPaths: new Set(),
    focusedItem: null,
    loadedProperties: new Map(),
    loading: new Map(),
  }, overrides);
}

function createStatePersister(id: any) {
  return store => next => action => {
    let result = next(action);
    let state = store.getState();
    persistedStates.set(id, state);
    return result;
  };
}

module.exports = (props: Props) => {
  if (!props.hasOwnProperty("id")) {
    throw Error("The ObjectInspector needs a unique `id` prop");
  }

  const initialState = persistedStates.get(props.id) || createInitialState({
    focusedItem: props.focusedItem,
  });

  const store = createStore(
    createReducer(initialState),
    applyMiddleware(thunk(), createStatePersister(props.id))
  );

  return createElement(
    Provider,
    {store},
    ObjectInspector(props)
  );
};

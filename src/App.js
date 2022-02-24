import { useSelector, useDispatch, Provider } from "react-redux";
import { createStore } from "redux";
import React, { useState } from "react";
import "./styles.css";
import produce from "immer";

const initialAppState = {
  app: {
    trees: {
      tree1: {
        visibleOverride: true,
        showChildMessages: true,
        children: [
          {
            name: "branch1",
            children: [
              {
                name: "child1"
              },
              {
                name: "child2"
              }
            ]
          },
          {
            name: "branch2",
            children: [
              {
                name: "child1"
              },
              {
                name: "child2"
              }
            ]
          }
        ]
      },
      // end tree1
      tree2: {
        visibleOverride: true,
        showChildMessages: true,
        children: [
          {
            name: "branch1",
            children: [
              {
                name: "child1"
              },
              {
                name: "child2"
              }
            ]
          },
          {
            name: "branch2",
            children: [
              {
                name: "child1"
              },
              {
                name: "child2"
              }
            ]
          }
        ]
      }
    }
  }
};

const appStateReducer = (state = initialAppState, action) => {
  switch (action.type) {
    default:
      return produce(state, (draft) => {
        draft.app.trees = treesReducer(draft.app.trees, action);
      });
  }
};

const treesReducer = (trees, action) => {
  switch (action.type) {
    case "tree-toggle-visible-override": {
      return produce(trees, (draft) => {
        draft[action.treeName].visibleOverride = !trees[action.treeName]
          .visibleOverride;
      });
    }

    case "tree-toggle-child-message": {
      return produce(trees, (draft) => {
        draft[action.treeName].showChildMessages = !trees[action.treeName]
          .showChildMessages;
      });
    }
    default:
      return trees;
  }
};

const store = createStore(appStateReducer);

function Penguin({ showMessage }) {
  return <div>Penguin {showMessage && <div>message</div>}</div>;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppBody />
    </Provider>
  );
}

function AppBody() {
  let [showWarningMessage, setShowWarningMessage] = useState(true);

  const toggleWarningMessage = () => setShowWarningMessage(!showWarningMessage);

  return (
    <div className="App">
      {showWarningMessage && <div>Warning Message</div>}

      <Tree
        treeName={"tree1"}
        onBranchExpandCollapse={toggleWarningMessage}
        CustomLeafComponent={Penguin}
      />

      <Tree
        treeName={"tree2"}
        onBranchExpandCollapse={toggleWarningMessage}
        CustomLeafComponent={Penguin}
      />
    </div>
  );
}

function Tree({ treeName, onBranchExpandCollapse, CustomLeafComponent }) {
  let tree = useSelector((state) => state.app.trees[treeName]);

  let dispatch = useDispatch();

  let toggleVisibleOverride = (treeName) =>
    dispatch({ type: "tree-toggle-visible-override", treeName: treeName });

  return (
    <div>
      {/* click this button to expand/collapse all groups */}
      <button onClick={() => toggleVisibleOverride("tree2")}>
        expand/collapse
      </button>

      {/* Tree 2 Child branches follow */}
      {tree.children.map((branchDetails) => {
        return (
          <Branch
            key={branchDetails.name}
            treeName={treeName}
            branchDetails={branchDetails}
            visibleOverride={tree.visibleOverride}
            onExpandCollapse={onBranchExpandCollapse}
            CustomLeafComponent={CustomLeafComponent}
          />
        );
      })}
    </div>
  );
}

// goal is to toggle the messages by clicking the buttons in any leaf

function Branch({
  treeName,
  branchDetails,
  visibleOverride,
  onExpandCollapse,
  CustomLeafComponent
}) {
  let [visible, setVisible] = useState(true);

  return (
    <div>
      {/* click this button to expand/collapse the child items */}
      <button
        onClick={() => {
          setVisible(!visible);
          if (onExpandCollapse != null) onExpandCollapse(treeName, !visible);
        }}
      >
        expand/collapse
      </button>
      Branch {branchDetails.name}
      {/* child items follow, optionally displayed */}
      {visibleOverride &&
        visible &&
        branchDetails.children.map((childDetails) => {
          return (
            <Leaf
              key={childDetails.name}
              treeName={treeName}
              childDetails={childDetails}
              CustomComponent={CustomLeafComponent}
            />
          );
        })}
    </div>
  );
}

function Leaf({ childDetails, treeName, CustomComponent }) {
  let showMessage = useSelector(
    (state) => state.app.trees[treeName].showChildMessages
  );
  let dispatch = useDispatch();

  return (
    <div>
      Leaf {childDetails.name}
      <button
        onClick={() => {
          dispatch({ type: "tree-toggle-child-message", treeName: treeName });
        }}
      >
        Communicate with sibling
      </button>
      {/* Optionally show custom component */}
      {CustomComponent != null && <CustomComponent showMessage={showMessage} />}
      {/* Otherwise show default component */}
      {CustomComponent == null && showMessage && <span>: message</span>}
    </div>
  );
}

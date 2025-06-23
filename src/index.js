import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Ag-Grid Modules
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    RowApiModule,
    RowSelectionModule,
    ValidationModule,
    ScrollApiModule,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    MasterDetailModule,
    RichSelectModule,
    TextEditorModule, // ✅ Text Editing
    NumberEditorModule, // ✅ Number Editing
} from 'ag-grid-enterprise';

// Register ag-Grid Modules
ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    RowSelectionModule,
    RowApiModule,
    HighlightChangesModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    RichSelectModule,
    ValidationModule /* Development Only */,
    ScrollApiModule,
    TextEditorModule,
    NumberEditorModule,
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

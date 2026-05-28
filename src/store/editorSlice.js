import { createSlice, nanoid } from '@reduxjs/toolkit';

const componentDefaults = {
  Text: {
    label: 'Text Block',
    content: '복잡한 코딩 없이 드래그 앤 드롭 방식으로 화면을 구성합니다.',
    width: 260,
    height: 128,
    fontSize: 14,
    color: '#1f2937',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 12,
    shadow: 0,
    align: 'left',
    eventName: 'onClick',
    eventHandler: 'showToast',
  },
  Image: {
    label: 'Image',
    content: 'Image',
    width: 180,
    height: 110,
    fontSize: 14,
    color: '#14506a',
    background: '#dff5ff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 6,
    padding: 10,
    shadow: 1,
    align: 'center',
    eventName: 'onLoad',
    eventHandler: 'trackAsset',
  },
  Button: {
    label: 'Button',
    content: 'Button',
    width: 180,
    height: 32,
    fontSize: 12,
    color: '#496474',
    background: '#e9f4fb',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 6,
    padding: 12,
    shadow: 2,
    align: 'center',
    eventName: 'onClick',
    eventHandler: 'submitForm',
  },
  Container: {
    label: 'Container',
    content: 'Drop Zone',
    width: 320,
    height: 150,
    fontSize: 14,
    color: '#335464',
    background: '#f7fbfd',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 14,
    shadow: 0,
    align: 'center',
    eventName: 'onDrop',
    eventHandler: 'appendChild',
  },
  Row: {
    label: 'Row',
    content: 'Row Layout',
    width: 330,
    height: 74,
    fontSize: 14,
    color: '#355160',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 10,
    shadow: 0,
    align: 'center',
    eventName: 'onResize',
    eventHandler: 'syncGrid',
  },
  Column: {
    label: 'Column',
    content: 'Column Layout',
    width: 116,
    height: 186,
    fontSize: 14,
    color: '#355160',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 10,
    shadow: 0,
    align: 'center',
    eventName: 'onResize',
    eventHandler: 'syncGrid',
  },
  Table: {
    label: 'Table',
    content: 'Table',
    width: 220,
    height: 132,
    fontSize: 13,
    color: '#1f2937',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 10,
    shadow: 0,
    align: 'left',
    eventName: 'onRowClick',
    eventHandler: 'openDetail',
  },
  Form: {
    label: 'Form',
    content: 'Form',
    width: 240,
    height: 142,
    fontSize: 13,
    color: '#1f2937',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 12,
    shadow: 1,
    align: 'left',
    eventName: 'onSubmit',
    eventHandler: 'validateForm',
  },
  Chart: {
    label: 'Chart',
    content: 'Chart',
    width: 230,
    height: 170,
    fontSize: 13,
    color: '#1f2937',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 12,
    shadow: 0,
    align: 'left',
    eventName: 'onPointClick',
    eventHandler: 'filterDataset',
  },
  Metric: {
    label: 'Metric',
    content: 'Error Rate',
    width: 160,
    height: 100,
    fontSize: 18,
    color: '#0f3f56',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 12,
    shadow: 1,
    align: 'center',
    eventName: 'onRefresh',
    eventHandler: 'reloadMetric',
  },
  ColorPicker: {
    label: 'Color Picker',
    content: 'Color Picker',
    width: 180,
    height: 110,
    fontSize: 13,
    color: '#1f2937',
    background: '#ffffff',
    borderColor: '#2384a0',
    borderWidth: 1,
    radius: 4,
    padding: 12,
    shadow: 0,
    align: 'center',
    eventName: 'onChange',
    eventHandler: 'setThemeColor',
  },
};

const initialState = {
  canvas: {
    name: 'Untitled Canvas',
    width: 760,
    height: 500,
    grid: 12,
    mode: 'Desktop',
    lastSavedAt: '2 mins ago',
  },
  canvasComponents: [
    {
      id: 'nav-1',
      type: 'Container',
      x: 32,
      y: 72,
      props: {
        ...componentDefaults.Container,
        label: 'Navigation',
        content: 'Navigation',
        width: 700,
        height: 46,
        background: '#edf7fb',
        align: 'left',
      },
    },
    {
      id: 'text-1',
      type: 'Text',
      x: 32,
      y: 246,
      props: {
        ...componentDefaults.Text,
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        width: 220,
        height: 152,
      },
    },
    {
      id: 'chart-1',
      type: 'Chart',
      x: 500,
      y: 246,
      props: componentDefaults.Chart,
    },
  ],
  selectedId: 'text-1',
  history: {
    past: [],
    future: [],
  },
};

const cloneComponent = (component) => ({
  ...component,
  props: { ...component.props },
});

const createSnapshot = (state) => ({
  canvas: { ...state.canvas },
  canvasComponents: state.canvasComponents.map(cloneComponent),
  selectedId: state.selectedId,
});

const restoreSnapshot = (state, snapshot) => {
  state.canvas = { ...snapshot.canvas };
  state.canvasComponents = snapshot.canvasComponents.map(cloneComponent);
  state.selectedId = snapshot.selectedId;
};

const pushHistory = (state) => {
  state.history.past.push(createSnapshot(state));
  if (state.history.past.length > 50) {
    state.history.past.shift();
  }
  state.history.future = [];
};

const createComponent = ({ type, x = 80, y = 80 }) => ({
  id: nanoid(),
  type,
  x,
  y,
  props: { ...(componentDefaults[type] || componentDefaults.Text) },
});

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    addComponent: (state, action) => {
      pushHistory(state);
      const component = createComponent(action.payload);
      state.canvasComponents.push(component);
      state.selectedId = component.id;
    },
    updateComponentProps: (state, action) => {
      const { id, props } = action.payload;
      const component = state.canvasComponents.find((item) => item.id === id);
      if (component) {
        const hasChanges = Object.entries(props).some(([key, value]) => component.props[key] !== value);
        if (!hasChanges) return;
        pushHistory(state);
        component.props = { ...component.props, ...props };
      }
    },
    updateComponentPosition: (state, action) => {
      const { id, x, y } = action.payload;
      const component = state.canvasComponents.find((item) => item.id === id);
      if (component) {
        if (component.x === x && component.y === y) return;
        pushHistory(state);
        component.x = x;
        component.y = y;
      }
    },
    selectComponent: (state, action) => {
      state.selectedId = action.payload;
    },
    deleteSelectedComponent: (state) => {
      if (!state.selectedId) return;
      pushHistory(state);
      state.canvasComponents = state.canvasComponents.filter((item) => item.id !== state.selectedId);
      state.selectedId = null;
    },
    clearCanvas: (state) => {
      if (state.canvasComponents.length === 0) return;
      pushHistory(state);
      state.canvasComponents = [];
      state.selectedId = null;
      state.canvas.name = 'New Canvas';
      state.canvas.lastSavedAt = 'Not saved';
    },
    setViewMode: (state, action) => {
      state.canvas.mode = action.payload;
    },
    undo: (state) => {
      const previous = state.history.past.pop();
      if (!previous) return;
      state.history.future.push(createSnapshot(state));
      restoreSnapshot(state, previous);
    },
    redo: (state) => {
      const next = state.history.future.pop();
      if (!next) return;
      state.history.past.push(createSnapshot(state));
      restoreSnapshot(state, next);
    },
  },
});

export const {
  addComponent,
  clearCanvas,
  deleteSelectedComponent,
  redo,
  selectComponent,
  setViewMode,
  undo,
  updateComponentPosition,
  updateComponentProps,
} = editorSlice.actions;
export { componentDefaults };
export default editorSlice.reducer;

import { DndContext, DragOverlay, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import {
  addComponent,
  clearCanvas,
  componentDefaults,
  deleteSelectedComponent,
  redo,
  setViewMode,
  undo,
  updateComponentPosition,
} from './store/editorSlice';

const groups = [
  {
    title: 'Basics',
    items: [
      { type: 'Text', icon: 'T', badge: 'D&D' },
      { type: 'Image', icon: '▧', badge: 'D&D' },
      { type: 'Button', icon: 'Button', badge: 'D&D' },
    ],
  },
  {
    title: 'Layout',
    items: [
      { type: 'Container', icon: '□', badge: 'D&D' },
      { type: 'Row', icon: '▥', badge: 'D&D' },
      { type: 'Column', icon: '▥', badge: 'D&D' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { type: 'Table', icon: '▦', badge: 'DSO' },
      { type: 'Form', icon: '▤', badge: 'D&D' },
      { type: 'Chart', icon: '▥', badge: 'DSD' },
      { type: 'Metric', icon: '◔', badge: 'DSO' },
      { type: 'ColorPicker', icon: '◉', badge: 'DSD' },
    ],
  },
];

const ToolButton = ({ children, onClick, active = false, disabled = false, title }) => (
  <button
    className={active ? 'tool-button is-active' : 'tool-button'}
    disabled={disabled}
    onClick={onClick}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const ComponentTile = ({ item }) => {
  const dispatch = useDispatch();
  const componentCount = useSelector((state) => state.editor.canvasComponents.length);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${item.type}`,
    data: { type: item.type, from: 'library' },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      className={isDragging ? 'component-tile is-dragging' : 'component-tile'}
      onClick={() => {
        const offset = (componentCount % 8) * 18;
        dispatch(addComponent({ type: item.type, x: 96 + offset, y: 132 + offset }));
      }}
      style={style}
      type="button"
      {...listeners}
      {...attributes}
    >
      <span className="tile-badge">{item.badge}</span>
      <span className={`tile-icon tile-icon-${item.type.toLowerCase()}`}>{item.icon}</span>
      <span className="tile-label">{componentDefaults[item.type].label}</span>
    </button>
  );
};

const ComponentLibrary = () => (
  <aside className="library-panel">
    <div className="panel-title">화면 에디터</div>
    {groups.map((group) => (
      <section className="library-group" key={group.title}>
        <button className="group-header" type="button">
          <span>{group.title}</span>
          <span>⌄</span>
        </button>
        <div className="tile-grid">
          {group.items.map((item) => (
            <ComponentTile item={item} key={item.type} />
          ))}
        </div>
      </section>
    ))}
  </aside>
);

const PreviewModal = ({ onClose }) => {
  const { name, mode } = useSelector((state) => state.editor.canvas);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Canvas preview">
      <div className="preview-header">
        <div>
          <strong>{name}</strong>
          <span>{mode} Preview</span>
        </div>
        <button className="tool-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <Canvas preview />
    </div>
  );
};

const Toolbar = () => {
  const dispatch = useDispatch();
  const { mode, lastSavedAt } = useSelector((state) => state.editor.canvas);
  const canUndo = useSelector((state) => state.editor.history.past.length > 0);
  const canRedo = useSelector((state) => state.editor.history.future.length > 0);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
    <div
      className="toolbar"
      onClick={(event) => {
        const buttonTitle = event.target.closest('button')?.title;
        if (buttonTitle === 'Preview') setPreviewOpen(true);
        if (buttonTitle === 'Undo' && canUndo) dispatch(undo());
        if (buttonTitle === 'Redo' && canRedo) dispatch(redo());
      }}
    >
      <button className="primary-action" onClick={() => dispatch(clearCanvas())} type="button">
        <span>＋</span>
        Add Section
      </button>
      <div className="toolbar-spacer" />
      <ToolButton title="Save">▣ Save</ToolButton>
      <ToolButton title="Preview">◉ Preview</ToolButton>
      <ToolButton title="Undo">↶ Undo</ToolButton>
      <ToolButton title="Redo">↷ Redo</ToolButton>
      <div className="toolbar-divider" />
      <ToolButton title="Grid settings">▦ Grid Settings</ToolButton>
      <div className="segmented-control" aria-label="View mode">
        {['Desktop', 'Mobile'].map((item) => (
          <button
            className={mode === item ? 'is-selected' : ''}
            key={item}
            onClick={() => dispatch(setViewMode(item))}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <ToolButton title="Export code">⇧ Export Code</ToolButton>
      <span className="save-status">Last Saved: {lastSavedAt}</span>
    </div>
    {previewOpen ? <PreviewModal onClose={() => setPreviewOpen(false)} /> : null}
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const selectedId = useSelector((state) => state.editor.selectedId);
  const [activeType, setActiveType] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const editableTags = ['INPUT', 'SELECT', 'TEXTAREA'];
      const target = event.target;
      const isEditingText =
        editableTags.includes(target.tagName) || target.isContentEditable;

      if (!selectedId || isEditingText) return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        dispatch(deleteSelectedComponent());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedId]);

  const handleDragStart = (event) => {
    const dragData = event.active.data.current;
    setActiveType(dragData?.from === 'library' ? dragData.type : null);
  };

  const handleDragEnd = (event) => {
    const dragData = event.active.data.current;
    const type = dragData?.type;
    const translated = event.active.rect.current.translated;
    const canvasRect = event.over?.rect;

    if (dragData?.from === 'library' && type && event.over?.id === 'canvas' && translated && canvasRect) {
      dispatch(
        addComponent({
          type,
          x: Math.max(12, Math.round(translated.left - canvasRect.left)),
          y: Math.max(12, Math.round(translated.top - canvasRect.top)),
        }),
      );
    }

    if (dragData?.from === 'canvas' && event.over?.id === 'canvas') {
      dispatch(
        updateComponentPosition({
          id: dragData.id,
          x: Math.max(12, Math.round(dragData.x + event.delta.x)),
          y: Math.max(12, Math.round(dragData.y + event.delta.y)),
        }),
      );
    }

    setActiveType(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveType(null)}>
      <div className="editor-shell">
        <ComponentLibrary />
        <main className="workspace-panel">
          <Toolbar />
          <Canvas />
        </main>
        <PropertyPanel />
      </div>
      <DragOverlay>
        {activeType ? <div className="drag-preview">{componentDefaults[activeType].label}</div> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;

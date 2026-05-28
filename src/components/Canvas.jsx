import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { selectComponent, updateComponentPosition, updateComponentProps } from '../store/editorSlice';

const ChartPreview = () => (
  <div className="chart-preview" aria-hidden="true">
    <div className="chart-axis">
      {[800, 600, 400, 200, 0].map((tick) => (
        <span key={tick}>{tick}</span>
      ))}
    </div>
    <div className="chart-body">
      <svg viewBox="0 0 160 82" role="img">
        <polyline points="6,62 38,34 72,58 108,28 152,9" fill="none" stroke="#2f7f9f" strokeWidth="2" />
        <polygon points="152,9 143,10 150,18" fill="#2f7f9f" />
      </svg>
      <div className="bars">
        {[30, 52, 36, 62, 82].map((height, index) => (
          <span style={{ height: `${height}%` }} key={index} />
        ))}
      </div>
    </div>
    <div className="legend">
      <span><i className="request" />Request Rate</span>
      <span><i className="error" />Error Rate</span>
    </div>
  </div>
);

const TablePreview = () => (
  <table className="table-preview">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Status</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Request</td>
        <td>Active</td>
        <td>82%</td>
      </tr>
      <tr>
        <td>Error</td>
        <td>Watch</td>
        <td>12%</td>
      </tr>
      <tr>
        <td>Latency</td>
        <td>Normal</td>
        <td>240ms</td>
      </tr>
    </tbody>
  </table>
);

const FormPreview = () => (
  <div className="form-preview" aria-hidden="true">
    <span />
    <span />
    <button type="button">Submit</button>
  </div>
);

const PalettePreview = () => (
  <div className="palette-preview" aria-hidden="true">
    {['#2f80ed', '#27ae60', '#f2994a', '#eb5757', '#9b51e0'].map((color) => (
      <span style={{ background: color }} key={color} />
    ))}
  </div>
);

const ImagePreview = () => (
  <div className="image-preview" aria-hidden="true">
    <span className="sun" />
    <span className="mountain" />
  </div>
);

const LayoutPreview = ({ type }) => (
  <div className={`layout-preview layout-${type.toLowerCase()}`} aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
);

const renderContent = (component) => {
  if (component.type === 'Chart') return <ChartPreview />;
  if (component.type === 'Table') return <TablePreview />;
  if (component.type === 'Form') return <FormPreview />;
  if (component.type === 'ColorPicker') return <PalettePreview />;
  if (component.type === 'Image') return <ImagePreview />;
  if (component.type === 'Button') return <span className="button-content">{component.props.content}</span>;
  if (component.type === 'Row' || component.type === 'Column') return <LayoutPreview type={component.type} />;
  if (component.type === 'Metric') {
    return (
      <div className="metric-preview">
        <strong>92.4%</strong>
        <span>{component.props.content}</span>
      </div>
    );
  }

  return (
    <>
      <strong>{component.props.label}</strong>
      <p>{component.props.content}</p>
    </>
  );
};

const CanvasComponentView = ({
  component,
  children,
  isDragging = false,
  preview = false,
  selected = false,
  setNodeRef,
  transform,
  interactionProps = {},
}) => {
  const shadow = component.props.shadow * 6;

  return (
    <div
      ref={setNodeRef}
      className={[
        'canvas-component',
        selected ? 'is-selected' : '',
        preview ? 'is-preview' : '',
      ].filter(Boolean).join(' ')}
      style={{
        left: component.x,
        top: component.y,
        transform,
        width: component.props.width - 40,
        height: component.props.height,
        color: component.props.color,
        background: component.props.background,
        borderColor: component.props.borderColor,
        borderWidth: component.props.borderWidth,
        borderRadius: component.props.radius,
        padding: component.props.padding,
        textAlign: component.props.align,
        fontSize: component.props.fontSize,
        opacity: isDragging ? 0.82 : 1,
        boxShadow: shadow ? `0 ${shadow}px ${shadow * 2}px rgba(35, 71, 91, 0.16)` : 'none',
      }}
      {...interactionProps}
    >
      {children}
    </div>
  );
};

const PreviewCanvasComponent = ({ component }) => (
  <CanvasComponentView component={component} preview>
    {renderContent(component)}
  </CanvasComponentView>
);

const CanvasComponent = ({ component, selected }) => {
  const dispatch = useDispatch();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-${component.id}`,
    data: {
      from: 'canvas',
      id: component.id,
      type: component.type,
      x: component.x,
      y: component.y,
    },
  });
  const dragTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;

  const handleResizeStart = (event, corner) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(selectComponent(component.id));

    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: component.x,
      y: component.y,
      width: component.props.width,
      height: component.props.height,
    };

    const resize = (moveEvent) => {
      const dx = moveEvent.clientX - start.pointerX;
      const dy = moveEvent.clientY - start.pointerY;
      const minWidth = 80;
      const minHeight = 46;
      let nextX = start.x;
      let nextY = start.y;
      let nextWidth = start.width;
      let nextHeight = start.height;

      if (corner.includes('right')) {
        nextWidth = Math.max(minWidth, start.width + dx);
      }

      if (corner.includes('bottom')) {
        nextHeight = Math.max(minHeight, start.height + dy);
      }

      if (corner.includes('left')) {
        nextWidth = Math.max(minWidth, start.width - dx);
        nextX = start.x + (start.width - nextWidth);
      }

      if (corner.includes('top')) {
        nextHeight = Math.max(minHeight, start.height - dy);
        nextY = start.y + (start.height - nextHeight);
      }

      dispatch(updateComponentProps({ id: component.id, props: { width: Math.round(nextWidth), height: Math.round(nextHeight) } }));
      dispatch(updateComponentPosition({ id: component.id, x: Math.round(nextX), y: Math.round(nextY) }));
    };

    const stopResize = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stopResize);
    };

    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stopResize);
  };

  return (
    <CanvasComponentView
      component={component}
      isDragging={isDragging}
      selected={selected}
      setNodeRef={setNodeRef}
      transform={dragTransform}
      interactionProps={{
        onClick: (event) => {
          event.stopPropagation();
          dispatch(selectComponent(component.id));
        },
        role: 'button',
        tabIndex: 0,
        ...listeners,
        ...attributes,
      }}
    >
      {/* {component.type === 'Button' ? null : <span className="component-tag">{component.props.label}</span>} */}
      {renderContent(component)}
      {selected ? (
        <>
          <span className="resize-handle top-left" onPointerDown={(event) => handleResizeStart(event, 'top-left')} />
          <span className="resize-handle top-right" onPointerDown={(event) => handleResizeStart(event, 'top-right')} />
          <span className="resize-handle bottom-left" onPointerDown={(event) => handleResizeStart(event, 'bottom-left')} />
          <span className="resize-handle bottom-right" onPointerDown={(event) => handleResizeStart(event, 'bottom-right')} />
        </>
      ) : null}
    </CanvasComponentView>
  );
};

const PreviewCanvas = () => {
  const { canvas, canvasComponents } = useSelector((state) => state.editor);
  const width = canvas.mode === 'Mobile' ? 360 : canvas.width;

  return (
    <section className="canvas-stage preview-stage">
      <div className="canvas-board is-preview" style={{ width, minHeight: canvas.height }}>
        {canvasComponents.map((component) => (
          <PreviewCanvasComponent component={component} key={component.id} />
        ))}
      </div>
    </section>
  );
};

const EditableCanvas = () => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  const { canvas, canvasComponents, selectedId } = useSelector((state) => state.editor);
  const dispatch = useDispatch();
  const width = canvas.mode === 'Mobile' ? 360 : canvas.width;

  return (
    <section
      className="canvas-stage"
      onClick={() => {
        dispatch(selectComponent(null));
      }}
    >
      <div
        ref={setNodeRef}
        className={isOver ? 'canvas-board is-over' : 'canvas-board'}
        style={{ width, minHeight: canvas.height }}
      >
        {canvasComponents.map((component) => (
          <CanvasComponent
            component={component}
            key={component.id}
            selected={selectedId === component.id}
          />
        ))}
      </div>
    </section>
  );
};

const Canvas = ({ preview = false }) => (preview ? <PreviewCanvas /> : <EditableCanvas />);

export default Canvas;

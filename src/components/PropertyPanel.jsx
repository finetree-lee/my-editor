import { useDispatch, useSelector } from 'react-redux';
import { updateComponentProps } from '../store/editorSlice';

const alignments = ['left', 'center', 'right', 'justify'];

const Field = ({ label, children }) => (
  <label className="property-field">
    <span>{label}</span>
    {children}
  </label>
);

const PropertyPanel = () => {
  const { selectedId, canvasComponents } = useSelector((state) => state.editor);
  const dispatch = useDispatch();
  const component = canvasComponents.find((item) => item.id === selectedId);

  const update = (props) => {
    if (component) {
      dispatch(updateComponentProps({ id: component.id, props }));
    }
  };

  return (
    <aside className="property-panel">
      <div className="property-header">
        <strong>{component ? `${component.type} Properties` : 'Text Properties'}</strong>
        <button type="button">⋯</button>
      </div>

      {!component ? (
        <div className="empty-state">
          <strong>컴포넌트를 선택해주세요.</strong>
          <span>캔버스의 항목을 클릭하면 스타일과 이벤트 속성을 수정할 수 있습니다.</span>
        </div>
      ) : (
        <>
          <section className="property-section">
            <h3>Text Properties</h3>
            <Field label="Text">
              <input value={component.props.content} onChange={(event) => update({ content: event.target.value })} />
            </Field>
            <Field label="Font">
              <select value={component.props.label} onChange={(event) => update({ label: event.target.value })}>
                <option>Text Block</option>
                <option>Button</option>
                <option>Chart</option>
                <option>Navigation</option>
                <option>Form</option>
              </select>
            </Field>
            <Field label="Size">
              <div className="range-field">
                <input
                  max="36"
                  min="10"
                  type="range"
                  value={component.props.fontSize}
                  onChange={(event) => update({ fontSize: Number(event.target.value) })}
                />
                <input
                  max="48"
                  min="8"
                  type="number"
                  value={component.props.fontSize}
                  onChange={(event) => update({ fontSize: Number(event.target.value) })}
                />
              </div>
            </Field>
            <Field label="Color">
              <div className="color-field">
                <input type="color" value={component.props.color} onChange={(event) => update({ color: event.target.value })} />
                <input
                  type="color"
                  value={component.props.background}
                  onChange={(event) => update({ background: event.target.value })}
                />
              </div>
            </Field>
            <Field label="Alignment">
              <div className="alignment-field">
                {alignments.map((align) => (
                  <button
                    className={component.props.align === align ? 'is-selected' : ''}
                    key={align}
                    onClick={() => update({ align })}
                    title={align}
                    type="button"
                  >
                    {align === 'left' ? '☰' : align === 'center' ? '≡' : align === 'right' ? '☷' : '▤'}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <section className="property-section">
            <h3>Style</h3>
            <Field label="Border">
              <div className="range-field">
                <input
                  max="6"
                  min="0"
                  type="range"
                  value={component.props.borderWidth}
                  onChange={(event) => update({ borderWidth: Number(event.target.value) })}
                />
                <input
                  max="10"
                  min="0"
                  type="number"
                  value={component.props.borderWidth}
                  onChange={(event) => update({ borderWidth: Number(event.target.value) })}
                />
              </div>
            </Field>
            <Field label="Shadow">
              <div className="range-field">
                <input
                  max="5"
                  min="0"
                  type="range"
                  value={component.props.shadow}
                  onChange={(event) => update({ shadow: Number(event.target.value) })}
                />
                <input
                  max="8"
                  min="0"
                  type="number"
                  value={component.props.shadow}
                  onChange={(event) => update({ shadow: Number(event.target.value) })}
                />
              </div>
            </Field>
            <div className="triple-field">
              <Field label="Padding">
                <input
                  min="0"
                  type="number"
                  value={component.props.padding}
                  onChange={(event) => update({ padding: Number(event.target.value) })}
                />
              </Field>
              <Field label="Radius">
                <input min="0" type="number" value={component.props.radius} onChange={(event) => update({ radius: Number(event.target.value) })} />
              </Field>
            </div>
          </section>

          <section className="property-section">
            <h3>Actions</h3>
            <Field label="Event">
              <select value={component.props.eventName} onChange={(event) => update({ eventName: event.target.value })}>
                <option>onClick</option>
                <option>onSubmit</option>
                <option>onChange</option>
                <option>onLoad</option>
                <option>onDrop</option>
              </select>
            </Field>
            <Field label="Handler">
              <input value={component.props.eventHandler} onChange={(event) => update({ eventHandler: event.target.value })} />
            </Field>
          </section>
        </>
      )}
    </aside>
  );
};

export default PropertyPanel;

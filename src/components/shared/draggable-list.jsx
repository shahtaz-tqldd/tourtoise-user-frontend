import React, { useCallback, useId, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { cn } from "@/lib/utils";

const DraggableListRow = ({
  accept,
  disabled,
  getItemId,
  index,
  item,
  onDropEnd,
  onMove,
  renderItem,
}) => {
  const rowRef = useRef(null);
  const itemId = getItemId(item);

  const [{ handlerId }, drop] = useDrop({
    accept,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(dragItem, monitor) {
      if (disabled || !rowRef.current) return;

      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = rowRef.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
    drop: () => ({ moved: true }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: accept,
    canDrag: !disabled,
    item: () => ({ id: itemId, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dragItem, monitor) => {
      if (!dragItem || !monitor.didDrop()) return;
      onDropEnd?.(dragItem.id);
    },
  });

  const setRowRef = useCallback(
    (node) => {
      rowRef.current = node;
      drag(drop(node));
    },
    [drag, drop],
  );

  return (
    <div ref={setRowRef} data-handler-id={handlerId}>
      {renderItem({ item, index, isDragging, disabled })}
    </div>
  );
};

const DraggableList = ({
  items,
  getItemId = (item) => item.id,
  onMove,
  onDropEnd,
  renderItem,
  disabled = false,
  className,
  accept,
}) => {
  const generatedId = useId();
  const itemType = accept || `draggable-list-${generatedId}`;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("space-y-4", className)}>
        {items.map((item, index) => (
          <DraggableListRow
            key={getItemId(item)}
            accept={itemType}
            disabled={disabled}
            getItemId={getItemId}
            index={index}
            item={item}
            onDropEnd={onDropEnd}
            onMove={onMove}
            renderItem={renderItem}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default DraggableList;

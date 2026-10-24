import { Table, RowSelectionState } from "@tanstack/react-table";
import React from "react";

interface UseGridKeyboardNavigationProps<TData> {
  table: Table<TData>;
  rowSelection: RowSelectionState;
  setRowSelection: (rowSelection: RowSelectionState) => void;
  enableMultiSelection: boolean;
  lastSelectedIndex: number | null;
  setLastSelectedIndex: (index: number | null) => void;
  shiftAnchorIndex: number | null;
  setShiftAnchorIndex: (index: number | null) => void;
  highlightedRowIds: Record<string, boolean>;
  setHighlightedRowIds: (ids: Record<string, boolean>) => void;
  setActiveRowId: (id: string | null) => void;
}

export function useGridKeyboardNavigation<TData>({
  table,
  rowSelection,
  setRowSelection,
  enableMultiSelection,
  lastSelectedIndex,
  setLastSelectedIndex,
  shiftAnchorIndex,
  setShiftAnchorIndex,
  highlightedRowIds,
  setHighlightedRowIds,
  setActiveRowId,
}: UseGridKeyboardNavigationProps<TData>) {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enableMultiSelection) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const newSelection = { ...rowSelection };
      Object.keys(highlightedRowIds).forEach(id => {
        newSelection[id] = true;
      });
      setRowSelection(newSelection);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      const rows = table.getRowModel().rows;
      if (rows.length === 0) return;

      if (lastSelectedIndex === null) {
        setLastSelectedIndex(0);
        setShiftAnchorIndex(0);
        setHighlightedRowIds({ [rows[0].id]: true });
        setActiveRowId(rows[0].id);
        return;
      }

      const nextIndex = e.key === 'ArrowDown' 
        ? Math.min(lastSelectedIndex + 1, rows.length - 1)
        : Math.max(lastSelectedIndex - 1, 0);

      if (nextIndex === lastSelectedIndex) return;

      if (e.shiftKey) {
        const anchor = shiftAnchorIndex !== null ? shiftAnchorIndex : lastSelectedIndex;
        if (shiftAnchorIndex === null) setShiftAnchorIndex(anchor);
        
        const newHighlights = { ...highlightedRowIds };
        
        const start = Math.min(anchor, nextIndex);
        const end = Math.max(anchor, nextIndex);
        
        const oldStart = Math.min(anchor, lastSelectedIndex);
        const oldEnd = Math.max(anchor, lastSelectedIndex);
        
        for (let i = oldStart; i <= oldEnd; i++) {
           delete newHighlights[rows[i].id];
        }
        
        for (let i = start; i <= end; i++) {
           newHighlights[rows[i].id] = true;
        }

        setHighlightedRowIds(newHighlights);
        setActiveRowId(rows[nextIndex].id);
        setLastSelectedIndex(nextIndex);
      } else {
        setShiftAnchorIndex(nextIndex);
        setHighlightedRowIds({ [rows[nextIndex].id]: true });
        setActiveRowId(rows[nextIndex].id);
        setLastSelectedIndex(nextIndex);
      }
    }
  };

  return { handleKeyDown };
}

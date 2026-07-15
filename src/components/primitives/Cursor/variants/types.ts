import type { CursorVariant } from '../../../../context/CursorContext';

/** Props every Mode cursor receives from the parent <Cursor> switch. */
export interface CursorViewProps {
  variant: CursorVariant;
  label: string;
  reduced: boolean;
}

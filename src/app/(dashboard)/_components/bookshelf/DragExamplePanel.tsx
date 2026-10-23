// src/app/(dashboard)/_components/bookshelf/DragExamplePanel.tsx
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";
import { BookTile, type TileBook } from "./BookTile";
import { DropSlot } from "./DropSlot";
import { FlowConnector } from "./FlowConnector";
import { ShelfCard, type ShelfView } from "./ShelfCard";

type DragExamplePanelProps = {
  book: TileBook;
  shelf: ShelfView;
};

export function DragExamplePanel({ book, shelf }: DragExamplePanelProps) {
  return (
    <Panel
      title="ドラッグ例"
      description="本を棚へドラッグして配置する流れの例です（実際のドラッグ操作は未接続）。"
    >
      <div className="grid grid-cols-[13rem_6rem_minmax(0,1fr)] items-center gap-4">
        <BookTile
          book={book}
          state="dragging"
          cover="tall"
          handle
          badge={<Badge variant="solid">ドラッグ中</Badge>}
        />
        <FlowConnector label="ドラッグ" />
        <ShelfCard
          shelf={shelf}
          highlight
          tileCover="tall"
          aside={<Badge variant="strong">ドロップ先</Badge>}
        >
          <DropSlot
            className="mt-3"
            title="ドロップ予定位置"
            description="ここで放すと、この位置に挿入されます"
          />
        </ShelfCard>
      </div>
    </Panel>
  );
}
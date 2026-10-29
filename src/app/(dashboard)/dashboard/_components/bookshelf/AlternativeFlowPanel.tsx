// src/app/(dashboard)/_components/bookshelf/AlternativeFlowPanel.tsx
import { Badge } from "../ui/Badge";
import { OutlineButton } from "../ui/OutlineButton";
import { Panel } from "../ui/Panel";
import { BookTile, type TileBook } from "./BookTile";
import { FlowConnector } from "./FlowConnector";
import { ShelfCard, type ShelfView } from "./ShelfCard";

type AlternativeFlowPanelProps = {
  book: TileBook;
  shelf: ShelfView;
};

export function AlternativeFlowPanel({ book, shelf }: AlternativeFlowPanelProps) {
  return (
    <Panel
      title="代替導線"
      description="ドラッグが難しいときは、本を選んで「本棚に追加」で配置できます。"
    >
      <div className="grid grid-cols-[13rem_6rem_minmax(0,1fr)] items-center gap-4">
        <BookTile
          book={book}
          state="selected"
          cover="tall"
          badge={<Badge variant="solid">選択中</Badge>}
        />
        <FlowConnector label="選択" />
        <ShelfCard
          shelf={shelf}
          tileCover="tall"
          footer={
            <div className="mt-3">
              <OutlineButton size="sm">本棚に追加</OutlineButton>
            </div>
          }
        />
      </div>
    </Panel>
  );
}
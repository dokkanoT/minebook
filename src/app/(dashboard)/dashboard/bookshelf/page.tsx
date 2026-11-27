"use client";

import { useEffect, useRef, useState, type DragEventHandler } from "react";
import { AlertCircle, CheckCircle2, RotateCcw, X } from "lucide-react";
import { BookPool } from "../_components/bookshelf/BookPool";
import { MyShelvesPanel } from "../_components/bookshelf/MyShelvesPanel";
import type { PoolBook } from "../_components/bookshelf/BookPool";
import {
  buildDefaultBookLocations,
  getRequiredShelfCellWidth,
  type ShelfBookLocation,
  type ShelfView,
} from "../_components/bookshelf/ShelfCard";
import { getSpineColor, getSpineWidth, type TileBook } from "../_components/bookshelf/BookTile";
import { CATEGORIES } from "../_data/books";
import { POOL_BOOKS, SHELVES } from "../_data/bookshelf";

const SHELF_COLORS = [
  { value: "slate", label: "グレー", className: "bg-slate-500" },
  { value: "rose", label: "ピンク", className: "bg-rose-500" },
  { value: "amber", label: "イエロー", className: "bg-amber-500" },
  { value: "emerald", label: "グリーン", className: "bg-emerald-500" },
  { value: "sky", label: "ブルー", className: "bg-sky-500" },
  { value: "violet", label: "パープル", className: "bg-violet-500" },
] as const;

type Notice = { message: string; tone: "success" | "return" | "delete" | "warning" };

function getShelfCells(rowCount: number, dividerPositionsByRow: number[][]) {
  return Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: (dividerPositionsByRow[row]?.length ?? 0) + 1 }, (_, compartment) => ({ row, compartment })),
  ).flat();
}

function getLeastOccupiedCell(
  shelf: ShelfView,
  locations: Record<string, ShelfBookLocation>,
  rowCount: number,
  dividerPositionsByRow: number[][],
  canFit: (cell: ShelfBookLocation) => boolean = () => true,
) {
  const cells = getShelfCells(rowCount, dividerPositionsByRow);
  const fittingCells = cells.filter(canFit);
  const candidates = fittingCells.length > 0 ? fittingCells : cells;
  return candidates.reduce((least, cell) => {
    const cellCount = shelf.books.filter((book) => {
      const location = locations[book.id];
      return location?.row === cell.row && location.compartment === cell.compartment;
    }).length;
    const leastCount = shelf.books.filter((book) => {
      const location = locations[book.id];
      return location?.row === least.row && location.compartment === least.compartment;
    }).length;
    return cellCount < leastCount ? cell : least;
  }, candidates[0] ?? { row: 0, compartment: 0 });
}

function getCompleteBookLocations(
  shelf: ShelfView,
  rowCount: number,
  dividerPositions: number[][],
  storedLocations?: Record<string, ShelfBookLocation>,
  displayedLocations?: Record<string, ShelfBookLocation>,
) {
  return {
    ...buildDefaultBookLocations(shelf.books, rowCount, dividerPositions),
    ...(displayedLocations ?? {}),
    ...(storedLocations ?? {}),
  };
}

function getShelfCellElement(shelfId: string, location: ShelfBookLocation) {
  const shelfElement = Array.from(document.querySelectorAll<HTMLElement>("[data-shelf-id]"))
    .find((element) => element.dataset.shelfId === shelfId);
  const rowElement = Array.from(shelfElement?.querySelectorAll<HTMLElement>("[data-shelf-row]") ?? [])
    .find((element) => Number(element.dataset.rowIndex) === location.row);
  return Array.from(rowElement?.querySelectorAll<HTMLElement>("[data-row-section]") ?? [])
    .find((element) => Number(element.dataset.sectionIndex) === location.compartment);
}

function canBookFitInCell(shelfId: string, location: ShelfBookLocation, book: TileBook) {
  const section = getShelfCellElement(shelfId, location);
  if (!section) return true;

  const requiredWidth = getRequiredShelfCellWidth(section, getSpineWidth(book.pageCount), book.id);
  return requiredWidth <= section.getBoundingClientRect().width + 0.5;
}

export default function BookshelfPage() {
  const [poolBooks, setPoolBooks] = useState<PoolBook[]>(POOL_BOOKS);
  const [shelves, setShelves] = useState<ShelfView[]>(SHELVES);
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [selectedBook, setSelectedBook] = useState<TileBook | null>(null);
  const [shelfToDelete, setShelfToDelete] = useState<ShelfView | null>(null);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [createShelfOpen, setCreateShelfOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfColor, setNewShelfColor] = useState<ShelfView["color"]>("slate");
  const [rowCountByShelf, setRowCountByShelf] = useState<Record<string, number>>({});
  const [dividerPositionsByShelf, setDividerPositionsByShelf] = useState<Record<string, number[][]>>({});
  const [bookLocationsByShelf, setBookLocationsByShelf] = useState<Record<string, Record<string, ShelfBookLocation>>>({});
  const [fullScreenShelfId, setFullScreenShelfId] = useState<string | null>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const scrollBeforeFullScreen = useRef<number | null>(null);

  useEffect(() => {
    if (fullScreenShelfId) {
      if (scrollBeforeFullScreen.current === null) scrollBeforeFullScreen.current = window.scrollY;
      return;
    }
    if (scrollBeforeFullScreen.current !== null) {
      const previousScrollY = scrollBeforeFullScreen.current;
      scrollBeforeFullScreen.current = null;
      requestAnimationFrame(() => window.scrollTo({ top: previousScrollY, behavior: "instant" }));
    }
  }, [fullScreenShelfId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedBook && !createShelfOpen && !shelfToDelete && !fullScreenShelfId) return;

    const closeTopDialog = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (moveMenuOpen) {
        setMoveMenuOpen(false);
      } else if (shelfToDelete) {
        setShelfToDelete(null);
      } else if (createShelfOpen) {
        setCreateShelfOpen(false);
      } else if (selectedBook) {
        setSelectedBook(null);
      } else if (fullScreenShelfId) {
        setFullScreenShelfId(null);
      }
    };

    window.addEventListener("keydown", closeTopDialog);
    return () => window.removeEventListener("keydown", closeTopDialog);
  }, [createShelfOpen, fullScreenShelfId, moveMenuOpen, selectedBook, shelfToDelete]);

  useEffect(() => {
    if (!fullScreenShelfId) return;
    const container = fullScreenRef.current;
    if (!container) return;

    const getFocusableElements = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusableElements()[0]?.focus();
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        container.focus();
      } else if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", keepFocusInside);
    return () => document.removeEventListener("keydown", keepFocusInside);
  }, [fullScreenShelfId]);

  useEffect(() => {
    const scrollNearEdge = (event: DragEvent) => {
      if (!draggingBookId) return;
      const edge = 76;
      const height = window.innerHeight;
      if (event.clientY < edge) {
        window.scrollBy({ top: -Math.ceil((edge - event.clientY) / 3), behavior: "auto" });
      } else if (event.clientY > height - edge) {
        window.scrollBy({ top: Math.ceil((event.clientY - (height - edge)) / 3), behavior: "auto" });
      }
    };

    document.addEventListener("dragover", scrollNearEdge);
    return () => document.removeEventListener("dragover", scrollNearEdge);
  }, [draggingBookId]);

  const handleDragStart: DragEventHandler<HTMLElement> = (event) => {
    const bookId = event.currentTarget.dataset.bookId;
    if (!bookId) return;
    event.dataTransfer.setData("text/plain", bookId);
    event.dataTransfer.effectAllowed = "move";
    const book = poolBooks.find((item) => item.id === bookId);
    if (book) {
      const preview = document.createElement("div");
      preview.setAttribute("aria-hidden", "true");
      Object.assign(preview.style, {
        position: "fixed",
        top: "-200px",
        left: "-200px",
        width: `${getSpineWidth(book.pageCount)}px`,
        height: "148px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 6px",
        border: "2px solid #171717",
        borderRadius: "3px 3px 0 0",
        background: getSpineColor(book.category),
        color: "white",
        boxShadow: "0 12px 24px rgb(0 0 0 / 28%)",
        font: "700 11px/1.2 sans-serif",
        writingMode: "vertical-rl",
      });
      const title = document.createElement("span");
      title.textContent = book.title;
      const score = document.createElement("span");
      score.textContent = String(book.score);
      preview.append(title, score);
      document.body.append(preview);
      event.dataTransfer.setDragImage(preview, 18, 30);
      window.setTimeout(() => preview.remove(), 0);
    }
    setDraggingBookId(bookId);
  };

  const handleDragEnd: DragEventHandler<HTMLElement> = () => {
    setDraggingBookId(null);
  };

  const moveBookToShelf = (
    shelfId: string,
    bookId: string,
    isShelfMove = false,
    beforeBookId?: string,
    requestedLocation?: ShelfBookLocation,
    displayedLocations?: Record<string, ShelfBookLocation>,
  ) => {
    const book = poolBooks.find((item) => item.id === bookId);
    const destination = shelves.find((shelf) => shelf.id === shelfId);
    if (!book || !destination) return;

    const currentShelf = shelves.find((shelf) => shelf.books.some((item) => item.id === bookId));
    const rowCount = rowCountByShelf[shelfId] ?? 1;
    const dividerPositions = dividerPositionsByShelf[shelfId] ?? [];
    const currentLocations = getCompleteBookLocations(
      destination,
      rowCount,
      dividerPositions,
      bookLocationsByShelf[shelfId],
      displayedLocations,
    );
    const targetLocation = requestedLocation ??
      (beforeBookId ? currentLocations[beforeBookId] : undefined) ??
      (currentShelf?.id === shelfId ? currentLocations[bookId] : undefined) ??
      getLeastOccupiedCell(destination, currentLocations, rowCount, dividerPositions,
        (cell) => canBookFitInCell(shelfId, cell, book));

    const currentLocation = currentShelf?.id === shelfId ? currentLocations[bookId] : undefined;
    const changesCell = !currentLocation || currentLocation.row !== targetLocation.row ||
      currentLocation.compartment !== targetLocation.compartment;
    if (changesCell && !canBookFitInCell(shelfId, targetLocation, book)) {
      setDraggingBookId(null);
      setNotice({
        message: `「${book.title}」が入りません。仕切りを動かして区画を広げてください`,
        tone: "warning",
      });
      return;
    }

    if (currentShelf?.id === shelfId) {
      if (beforeBookId === bookId) return;

      const reorderedBooks = [...destination.books];
      const currentIndex = reorderedBooks.findIndex((item) => item.id === bookId);
      const [movingBook] = reorderedBooks.splice(currentIndex, 1);
      const targetIndex = beforeBookId
        ? reorderedBooks.findIndex((item) => item.id === beforeBookId)
        : -1;
      reorderedBooks.splice(targetIndex < 0 ? reorderedBooks.length : targetIndex, 0, movingBook);

      const sameOrder = reorderedBooks.every((item, index) => item.id === destination.books[index]?.id);
      const oldLocation = currentLocations[bookId];
      const sameLocation = oldLocation?.row === targetLocation.row && oldLocation.compartment === targetLocation.compartment;
      if (sameOrder && sameLocation) return;

      setBookLocationsByShelf((current) => ({
        ...current,
        [shelfId]: { ...(current[shelfId] ?? currentLocations), [bookId]: targetLocation },
      }));

      if (!sameOrder) {
        setShelves((currentShelves) =>
          currentShelves.map((shelf) =>
            shelf.id === shelfId ? { ...shelf, books: reorderedBooks } : shelf,
          ),
        );
      }
      setDraggingBookId(null);
      setNotice({
        message: sameLocation
          ? `「${book.title}」を並べ替えました`
          : `「${book.title}」を${targetLocation.row + 1}段目の区画へ移しました`,
        tone: "success",
      });
      return;
    }

    setShelves((currentShelves) =>
      currentShelves.map((shelf) => {
        const books = shelf.books.filter((item) => item.id !== bookId);
        if (shelf.id !== shelfId) return { ...shelf, books };
        const targetIndex = beforeBookId
          ? books.findIndex((item) => item.id === beforeBookId)
          : -1;
        if (targetIndex < 0) books.push(book);
        else books.splice(targetIndex, 0, book);
        return { ...shelf, books };
      }),
    );
    setPoolBooks((currentBooks) =>
      currentBooks.map((item) => (item.id === bookId ? { ...item, placed: true } : item)),
    );
    setBookLocationsByShelf((current) => {
      const next = { ...current };
      if (currentShelf) {
        const sourceRowCount = rowCountByShelf[currentShelf.id] ?? 1;
        const sourceDividers = dividerPositionsByShelf[currentShelf.id] ?? [];
        const sourceLocations = getCompleteBookLocations(
          currentShelf,
          sourceRowCount,
          sourceDividers,
          next[currentShelf.id],
        );
        const source = { ...sourceLocations };
        delete source[bookId];
        next[currentShelf.id] = source;
      }
      next[shelfId] = {
        ...currentLocations,
        ...(next[shelfId] ?? {}),
        [bookId]: targetLocation,
      };
      return next;
    });
    setDraggingBookId(null);
    setNotice({
      message: isShelfMove ? `「${book.title}」を別の棚へ移動しました` : `「${book.title}」を本棚に追加しました`,
      tone: "success",
    });
  };

  const moveBookToPool = (bookId: string) => {
    const book = poolBooks.find((item) => item.id === bookId);
    if (!book?.placed) return;

    setShelves((currentShelves) =>
      currentShelves.map((shelf) => ({
        ...shelf,
        books: shelf.books.filter((item) => item.id !== bookId),
      })),
    );
    setPoolBooks((currentBooks) =>
      currentBooks.map((item) => (item.id === bookId ? { ...item, placed: false } : item)),
    );
    setBookLocationsByShelf((current) => Object.fromEntries(
      Object.entries(current).map(([shelfId, locations]) => {
        const nextLocations = { ...locations };
        delete nextLocations[bookId];
        return [shelfId, nextLocations];
      }),
    ));
    setDraggingBookId(null);
    setNotice({ message: `「${book.title}」を未配置に戻しました`, tone: "return" });
  };

  const deleteShelf = (shelfId: string) => {
    const shelf = shelves.find((item) => item.id === shelfId);
    if (!shelf) return;

    const returnedBookIds = new Set(shelf.books.map((book) => book.id));
    setShelves((currentShelves) => currentShelves.filter((item) => item.id !== shelfId));
    setBookLocationsByShelf((current) => {
      const next = { ...current };
      delete next[shelfId];
      return next;
    });
    setDividerPositionsByShelf((current) => {
      const next = { ...current };
      delete next[shelfId];
      return next;
    });
    setRowCountByShelf((current) => {
      const next = { ...current };
      delete next[shelfId];
      return next;
    });
    setPoolBooks((currentBooks) =>
      currentBooks.map((book) =>
        returnedBookIds.has(book.id) ? { ...book, placed: false } : book,
      ),
    );
    if (selectedBook && returnedBookIds.has(selectedBook.id)) setSelectedBook(null);
    setShelfToDelete(null);
    if (fullScreenShelfId === shelfId) setFullScreenShelfId(null);
    setNotice({ message: `「${shelf.name}」を削除しました`, tone: "delete" });
  };

  const createShelf = () => {
    const name = newShelfName.trim();
    if (!name) return;
    setShelves((currentShelves) => [
      ...currentShelves,
      { id: `shelf-${Date.now()}`, name, color: newShelfColor, books: [] },
    ]);
    setNotice({ message: `「${name}」を作成しました`, tone: "success" });
    setNewShelfName("");
    setNewShelfColor("slate");
    setCreateShelfOpen(false);
  };

  const addShelfDivider = (shelfId: string, row: number) => {
    const shelf = shelves.find((item) => item.id === shelfId);
    if (!shelf) return;
    const rowCount = rowCountByShelf[shelfId] ?? 1;
    const rows = dividerPositionsByShelf[shelfId] ?? [];
    const locations = getCompleteBookLocations(
      shelf,
      rowCount,
      rows,
      bookLocationsByShelf[shelfId],
    );
    const positions = [...(rows[row] ?? [])];
    if (positions.length >= 4) return;

    const boundaries = [0, ...positions, 100];
    const shelfElement = Array.from(document.querySelectorAll<HTMLElement>("[data-shelf-id]"))
      .find((element) => element.dataset.shelfId === shelfId);
    const rowElement = Array.from(shelfElement?.querySelectorAll<HTMLElement>("[data-shelf-row]") ?? [])
      .find((element) => Number(element.dataset.rowIndex) === row);
    const rowWidth = rowElement?.clientWidth ?? 0;
    const sections = Array.from(rowElement?.querySelectorAll<HTMLElement>("[data-row-section]") ?? []);
    const candidates = boundaries.slice(0, -1).map((start, compartment) => {
      const end = boundaries[compartment + 1];
      const books = shelf.books.filter((book) => {
        const location = locations[book.id];
        return location?.row === row && location.compartment === compartment;
      });
      const section = sections.find((element) => Number(element.dataset.sectionIndex) === compartment);
      const fallbackWidth = books.reduce((total, book) => total + getSpineWidth(book.pageCount), 0) +
        Math.max(0, books.length - 1) * 6 + (books.length ? 39 : 0);
      const requiredWidth = section
        ? getRequiredShelfCellWidth(section, 0, undefined, true)
        : fallbackWidth;
      const usedPercent = rowWidth ? (requiredWidth / rowWidth) * 100 : 0;
      const minimumOffset = books.length ? usedPercent + 3 : 4;
      return { start, end, compartment, books, usedPercent, minimumOffset, gap: end - start };
    }).filter((candidate) => candidate.gap >= candidate.minimumOffset + 4);
    if (candidates.length === 0) return;
    candidates.sort((left, right) => {
      const leftEmpty = left.books.length === 0;
      const rightEmpty = right.books.length === 0;
      if (leftEmpty !== rightEmpty) return leftEmpty ? -1 : 1;
      return right.gap - left.gap;
    });
    const chosen = candidates[0];
    const preferredOffset = chosen.books.length
      ? Math.max(chosen.gap * 0.58, chosen.minimumOffset)
      : chosen.gap / 2;
    const nextPosition = chosen.start + Math.min(chosen.gap - 4, Math.max(chosen.minimumOffset, preferredOffset));
    const nextPositions = [...positions, nextPosition].sort((a, b) => a - b);
    const nextRows = [...rows];
    nextRows[row] = nextPositions;

    setBookLocationsByShelf((current) => {
      const nextLocations = { ...locations, ...(current[shelfId] ?? {}) };
      for (const book of shelf.books) {
        const location = nextLocations[book.id];
        if (location?.row === row && location.compartment > chosen.compartment) {
          nextLocations[book.id] = { ...location, compartment: location.compartment + 1 };
        }
      }
      return { ...current, [shelfId]: nextLocations };
    });
    setDividerPositionsByShelf((current) => {
      const next = [...(current[shelfId] ?? [])];
      next[row] = nextPositions;
      return { ...current, [shelfId]: next };
    });
  };

  const moveShelfDivider = (shelfId: string, row: number, index: number, position: number) => {
    setDividerPositionsByShelf((current) => {
      const rows = [...(current[shelfId] ?? [])];
      const positions = [...(rows[row] ?? [])];
      const min = index === 0 ? 4 : positions[index - 1] + 4;
      const max = index === positions.length - 1 ? 96 : positions[index + 1] - 4;
      positions[index] = Math.min(max, Math.max(min, position));
      rows[row] = positions;
      return { ...current, [shelfId]: rows };
    });
  };

  const removeShelfDivider = (shelfId: string, row: number, index: number) => {
    const shelf = shelves.find((item) => item.id === shelfId);
    if (!shelf) return;
    const rowCount = rowCountByShelf[shelfId] ?? 1;
    const rows = dividerPositionsByShelf[shelfId] ?? [];
    const locations = getCompleteBookLocations(
      shelf,
      rowCount,
      rows,
      bookLocationsByShelf[shelfId],
    );
    setBookLocationsByShelf((current) => {
      const nextLocations = { ...locations, ...(current[shelfId] ?? {}) };
      for (const book of shelf.books) {
        const location = nextLocations[book.id];
        if (location?.row === row && location.compartment > index) {
          nextLocations[book.id] = { ...location, compartment: location.compartment - 1 };
        }
      }
      return { ...current, [shelfId]: nextLocations };
    });
    setDividerPositionsByShelf((current) => {
      const rows = [...(current[shelfId] ?? [])];
      rows[row] = (rows[row] ?? []).filter((_, positionIndex) => positionIndex !== index);
      return { ...current, [shelfId]: rows };
    });
  };

  const changeShelfRowCount = (
    shelfId: string,
    rowCount: number,
    displayedLocations: Record<string, ShelfBookLocation>,
    displayedBooks: TileBook[],
  ) => {
    const shelf = shelves.find((item) => item.id === shelfId);
    if (!shelf) return;
    const dividerPositions = dividerPositionsByShelf[shelfId] ?? [];
    const storedLocations = bookLocationsByShelf[shelfId];

    if (!storedLocations) {
      setBookLocationsByShelf((current) => ({
        ...current,
        [shelfId]: buildDefaultBookLocations(displayedBooks, rowCount, dividerPositions),
      }));
    } else {
      const cells = getShelfCells(rowCount, dividerPositions);
      const nextLocations: Record<string, ShelfBookLocation> = {};
      const occupancy = new Map<string, number>();
      for (const book of shelf.books) {
        const oldLocation = displayedLocations[book.id] ?? storedLocations[book.id];
        const isValid = oldLocation && oldLocation.row < rowCount &&
          oldLocation.compartment <= (dividerPositions[oldLocation.row]?.length ?? 0);
        const location = isValid ? oldLocation : cells.reduce((least, cell) => {
          const leastCount = occupancy.get(`${least.row}:${least.compartment}`) ?? 0;
          const cellCount = occupancy.get(`${cell.row}:${cell.compartment}`) ?? 0;
          return cellCount < leastCount ? cell : least;
        }, cells[0] ?? { row: 0, compartment: 0 });
        nextLocations[book.id] = location;
        const key = `${location.row}:${location.compartment}`;
        occupancy.set(key, (occupancy.get(key) ?? 0) + 1);
      }
      setBookLocationsByShelf((current) => ({ ...current, [shelfId]: nextLocations }));
    }
    setRowCountByShelf((current) => ({ ...current, [shelfId]: rowCount }));
  };

  const shelfPanel = (isFullScreen: boolean, visibleShelves = shelves) => (
    <MyShelvesPanel
      shelves={visibleShelves}
      onDropBook={(shelfId, bookId, beforeBookId, location, displayedLocations) =>
        moveBookToShelf(shelfId, bookId, false, beforeBookId, location, displayedLocations)
      }
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggingBookId={draggingBookId}
      onCreateShelf={() => setCreateShelfOpen(true)}
      onBookClick={setSelectedBook}
      onDeleteShelf={(shelf) => setShelfToDelete(shelf)}
      rowCountByShelf={rowCountByShelf}
      onChangeRowCount={changeShelfRowCount}
      dividerPositionsByShelf={dividerPositionsByShelf}
      bookLocationsByShelf={bookLocationsByShelf}
      onAddDivider={addShelfDivider}
      onMoveDivider={moveShelfDivider}
      onRemoveDivider={removeShelfDivider}
      fullScreenShelfId={fullScreenShelfId}
      onToggleFullScreen={(shelfId) =>
        setFullScreenShelfId((current) => (current === shelfId ? null : shelfId))
      }
      fullScreen={isFullScreen}
    />
  );

  return (
    <>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">本棚</h1>
          <p className="mt-1 text-xs text-neutral-600">
            未配置の本をドラッグして棚に置きます。背表紙を押すと本の詳細が開きます。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-600">
          {CATEGORIES.slice(0, 4).map((category) => (
            <span key={category} className="inline-flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-[1px] ${
                  {
                    文学: "bg-sky-600",
                    芸術: "bg-violet-600",
                    人文: "bg-amber-600",
                    自然科学: "bg-emerald-600",
                  }[category] ?? "bg-neutral-500"
                }`}
                aria-hidden
              />
              {category}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-[1px] bg-neutral-400" aria-hidden />
            上のお宝度 85以上
          </span>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[70] flex w-[min(24rem,calc(100vw-2.5rem))] items-center gap-3 rounded-xl border bg-white/95 px-4 py-3 text-sm font-medium shadow-xl shadow-neutral-900/10 backdrop-blur ${
            notice.tone === "return"
              ? "border-orange-200 text-orange-950"
              : notice.tone === "delete"
                ? "border-red-200 text-red-900"
                : notice.tone === "warning"
                  ? "border-amber-200 text-amber-950"
                : "border-emerald-200 text-emerald-900"
          }`}
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notice.tone === "return" ? "bg-orange-100" : notice.tone === "delete" ? "bg-red-100" : notice.tone === "warning" ? "bg-amber-100" : "bg-emerald-100"}`}>
            {notice.tone === "return" ? (
              <RotateCcw className="h-4 w-4 text-orange-700" aria-hidden />
            ) : notice.tone === "delete" ? (
              <X className="h-4 w-4 text-red-700" aria-hidden />
            ) : notice.tone === "warning" ? (
              <AlertCircle className="h-4 w-4 text-amber-700" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
            )}
          </span>
          <span className="flex-1">{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="通知を閉じる" className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {fullScreenShelfId ? (
        <div
          ref={fullScreenRef}
          role="dialog"
          aria-modal="true"
          aria-label="本棚の全画面表示"
          tabIndex={-1}
          className="fixed inset-0 z-40 overflow-hidden bg-neutral-100 p-3 sm:p-5"
        >
          {shelfPanel(true, shelves.filter((shelf) => shelf.id === fullScreenShelfId))}
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
          <BookPool
            books={poolBooks}
            shelves={shelves.map(({ id, name }) => ({ id, name }))}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDropBook={moveBookToPool}
            onQuickAdd={(bookId, shelfId) => moveBookToShelf(shelfId, bookId)}
            dropActive={draggingBookId !== null}
            draggingBookId={draggingBookId}
          />
          {shelfPanel(false)}
        </div>
      )}

      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-4"
          onClick={() => setSelectedBook(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-detail-title"
            className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(event) => {
              event.stopPropagation();
              setMoveMenuOpen(false);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-neutral-500">本の詳細</p>
                <h2 id="book-detail-title" className="mt-1 text-lg font-bold">{selectedBook.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                aria-label="閉じる"
                className="rounded-sm p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[5rem_1fr] gap-y-2 border-t border-neutral-200 pt-4 text-xs">
              <dt className="text-neutral-500">著者</dt><dd>{selectedBook.author}</dd>
              <dt className="text-neutral-500">カテゴリ</dt><dd>{selectedBook.category}</dd>
              <dt className="text-neutral-500">ページ数</dt><dd>{selectedBook.pageCount}ページ</dd>
              <dt className="text-neutral-500">お宝度</dt><dd>{selectedBook.score}</dd>
            </dl>
            {shelves.some((shelf) => shelf.books.some((book) => book.id === selectedBook.id)) && (
              <div className="relative mt-5 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  aria-expanded={moveMenuOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMoveMenuOpen((open) => !open);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-sm bg-neutral-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  棚移動
                </button>
                {moveMenuOpen && (
                  <div className="absolute left-0 top-full z-10 mt-2 min-w-44 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl">
                    {shelves.filter((shelf) => shelf.id !== shelves.find((item) => item.books.some((book) => book.id === selectedBook.id))?.id).map((shelf) => (
                      <button
                        key={shelf.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveBookToShelf(shelf.id, selectedBook.id, true);
                          setSelectedBook(null);
                          setMoveMenuOpen(false);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-100"
                      >
                        {shelf.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {createShelfOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/45 p-4" onClick={() => setCreateShelfOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-shelf-title" className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-neutral-500">マイ本棚</p>
                <h2 id="create-shelf-title" className="mt-1 text-lg font-bold">新しい棚を作成</h2>
              </div>
              <button type="button" onClick={() => setCreateShelfOpen(false)} aria-label="閉じる" className="rounded-sm p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <label className="mt-5 block text-xs font-medium text-neutral-700">
              棚の名前
              <input autoFocus value={newShelfName} onChange={(event) => setNewShelfName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createShelf(); }} placeholder="例：読み返したい本" className="mt-1.5 h-10 w-full rounded-sm border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10" />
            </label>
            <fieldset className="mt-5">
              <legend className="text-xs font-medium text-neutral-700">棚の色</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SHELF_COLORS.map((color) => (
                  <button key={color.value} type="button" onClick={() => setNewShelfColor(color.value)} aria-label={color.label} aria-pressed={newShelfColor === color.value} className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${newShelfColor === color.value ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2" : "border-transparent hover:scale-105"}`}>
                    <span className={`h-6 w-6 rounded-full ${color.className}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setCreateShelfOpen(false)} className="h-9 rounded-sm border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50">キャンセル</button>
              <button type="button" onClick={createShelf} disabled={!newShelfName.trim()} className="h-9 rounded-sm bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40">棚を作成</button>
            </div>
          </section>
        </div>
      )}

      {shelfToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/45 p-4"
          onClick={() => setShelfToDelete(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-shelf-title"
            aria-describedby="delete-shelf-description"
            className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[10px] font-semibold text-neutral-500">マイ本棚</p>
            <h2 id="delete-shelf-title" className="mt-1 text-lg font-bold">棚を削除しますか？</h2>
            <p id="delete-shelf-description" className="mt-3 text-sm leading-relaxed text-neutral-600">
              「{shelfToDelete.name}」を削除します。
              {shelfToDelete.books.length > 0
                ? ` 棚の中の${shelfToDelete.books.length}冊は収集プールの「未配置」に戻ります。`
                : ""}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShelfToDelete(null)}
                className="h-9 rounded-sm border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => deleteShelf(shelfToDelete.id)}
                className="h-9 rounded-sm bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800"
              >
                棚を削除
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

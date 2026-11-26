'use client';

import React, { useRef, useState } from 'react';
import { ScanScreen } from './ScanScreen';
import { lookupBook } from '@/features/books/actions';
import { addToCollection, updateCollectionItem } from '@/features/collection/actions';
import { BookBottomSheet } from '../book/BookBottomSheet';
import { INITIAL_BOOKS } from '../../_data/mockData';
import { evaluateBookPrice } from '../../_data/bookEvaluation';
import type { BookItem, FlagType, ScannedItem, SheetState } from '../../_data/types';

interface ScanWorkspaceProps {
  initialScannedList: ScannedItem[];
}

function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof err.digest === 'string' &&
    err.digest.startsWith('NEXT_REDIRECT')
  );
}

/**
 * スキャン画面の端末側インタラクション（ISBN検索・評価・フラグ保存・ボトムシート）を管理するクライアント部品
 */
export function ScanWorkspace({ initialScannedList }: ScanWorkspaceProps) {
  const [scannedList, setScannedList] =
    useState<ScannedItem[]>(initialScannedList);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('closed');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [booksById, setBooksById] = useState<Record<string, BookItem>>({});

  // 価格評価とフラグ設定の連続操作で二重登録されないよう、書籍ID単位でDB同期を直列化する
  const collectionIdRef = useRef<Record<string, string>>({});
  const syncQueueRef = useRef<Record<string, Promise<void>>>({});

  const handleSearchIsbn = async (isbn: string): Promise<boolean> => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await lookupBook(isbn);

      if (!result.ok) {
        if (result.error === 'invalid_isbn') {
          setSearchError('ISBN形式が正しくありません。(10桁または13桁の数字)');
        } else if (result.error === 'not_found') {
          setSearchError('該当する書籍が見つかりませんでした。');
        } else {
          setSearchError('書籍情報の取得に失敗しました。');
        }
        return false;
      }

      const dbBook = result.book;
      const itemId = `book-${dbBook.isbn}-${Date.now()}`;

      const newBookItem: BookItem = {
        id: itemId,
        isMock: false,
        title: dbBook.title,
        author: dbBook.author ?? '不明',
        coverUrl: dbBook.cover_url ?? undefined,
        scanDate: new Date().toLocaleDateString('ja-JP'),
        categoryTag: dbBook.category ?? undefined,
        originalPrice: dbBook.list_price ?? 0,
        shopPrice: 0,
        storeName: '古本屋',
        isbn: dbBook.isbn,
        publishedYear: '',
        publisher: dbBook.publisher ?? '情報なし',
        description: dbBook.description ?? 'あらすじ情報はありません。',
        // レビューがない本は ReviewCard が表示されない
        reviewRating: dbBook.review_average ?? undefined,
        reviewCount: dbBook.review_count ?? undefined,
        reviewSource: '楽天ブックス',
        flag: 'none',
      };

      setBooksById((prev) => ({ ...prev, [itemId]: newBookItem }));
      setScannedList((prev) => [
        {
          id: itemId,
          title: dbBook.title,
          coverUrl: dbBook.cover_url ?? undefined,
          statusText: '未評価・価格未入力',
          isEvaluated: false,
          isMock: false,
          isNew: true,
        },
        ...prev.map((b) => ({ ...b, isNew: false })),
      ]);
      return true;
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setSearchError('書籍情報の取得中にエラーが発生しました。');
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const enqueueBookSync = (
    book: BookItem,
    updates: { storePrice?: number; status?: FlagType },
  ) => {
    if (book.isMock || !/^97[89]\d{10}$/.test(book.isbn)) return;

    const prevTask = syncQueueRef.current[book.id] ?? Promise.resolve();
    const nextTask = prevTask
      .catch(() => undefined)
      .then(async () => {
        const dbStatus =
          updates.status === undefined
            ? undefined
            : updates.status === 'none'
              ? null
              : updates.status;

        const existingCollectionId =
          collectionIdRef.current[book.id] ?? book.collectionItemId;

        if (existingCollectionId) {
          const res = await updateCollectionItem({
            id: existingCollectionId,
            storePrice: updates.storePrice,
            status: dbStatus,
          });
          if (res.ok) {
            setSaveError(null);
          } else {
            setSaveError(res.error);
          }
          return;
        }

        const initialStatus =
          book.flag && book.flag !== 'none' ? book.flag : undefined;
        const res = await addToCollection({
          isbn: book.isbn,
          storePrice:
            updates.storePrice ?? (book.isEvaluated ? book.shopPrice : undefined),
          status: dbStatus ?? initialStatus,
        });

        if (res.ok) {
          const savedId = res.data.id;
          collectionIdRef.current[book.id] = savedId;
          setSaveError(null);
          setSelectedBook((prev) =>
            prev && prev.id === book.id
              ? { ...prev, collectionItemId: savedId }
              : prev,
          );
          setBooksById((prev) => ({
            ...prev,
            [book.id]: {
              ...(prev[book.id] ?? book),
              collectionItemId: savedId,
            },
          }));
        } else {
          setSaveError(res.error);
        }
      })
      .catch((err) => {
        if (isNextRedirectError(err)) throw err;
        setSaveError('DBへの保存中にエラーが発生しました。');
      });

    syncQueueRef.current[book.id] = nextTask;
  };

  const handleOpenEvaluation = (item: ScannedItem) => {
    setSaveError(null);

    const existing = booksById[item.id];
    if (existing) {
      setSelectedBook(existing);
      setSheetState('half');
      return;
    }

    // 仮データ由来の項目を開いた場合も item.id ごとに状態を保持できるようにする
    const templateBook =
      INITIAL_BOOKS.find((b) => b.title === item.title) ||
      INITIAL_BOOKS.find(
        (b) => b.title.includes(item.title) || item.title.includes(b.title),
      ) ||
      (item.isEvaluated === false
        ? INITIAL_BOOKS.find((b) => !b.isEvaluated)
        : undefined) ||
      INITIAL_BOOKS[0];

    const matchedBook: BookItem = {
      ...templateBook,
      id: item.id,
      title: item.title,
      coverUrl: item.coverUrl ?? templateBook.coverUrl,
      isEvaluated: item.isEvaluated,
      rank: item.rank ?? templateBook.rank,
      isMock: item.isMock ?? templateBook.isMock ?? true,
    };

    setBooksById((prev) => ({ ...prev, [item.id]: matchedBook }));
    setSelectedBook(matchedBook);
    setSheetState('half');
  };

  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const { rank } = evaluateBookPrice(selectedBook.originalPrice, price);
    const updatedBook: BookItem = {
      ...selectedBook,
      collectionItemId:
        collectionIdRef.current[selectedBook.id] ?? selectedBook.collectionItemId,
      isEvaluated: true,
      shopPrice: price,
      rank,
    };

    setSelectedBook(updatedBook);
    setBooksById((prev) => ({ ...prev, [selectedBook.id]: updatedBook }));

    // ID一致で該当の行のみステータスを更新する
    setScannedList((prev) =>
      prev.map((item) =>
        item.id === selectedBook.id
          ? {
              ...item,
              isEvaluated: true,
              rank,
              statusText: `評価済・¥${price.toLocaleString()}・${rank}`,
            }
          : item,
      ),
    );
    enqueueBookSync(updatedBook, { storePrice: price });
  };

  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook: BookItem = {
      ...selectedBook,
      collectionItemId:
        collectionIdRef.current[selectedBook.id] ?? selectedBook.collectionItemId,
      flag,
    };
    setSelectedBook(updatedBook);
    setBooksById((prev) => ({ ...prev, [selectedBook.id]: updatedBook }));
    enqueueBookSync(updatedBook, { status: flag });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <ScanScreen
        scannedList={scannedList}
        onScannedListChange={setScannedList}
        onOpenEvaluation={handleOpenEvaluation}
        onSearchIsbn={handleSearchIsbn}
        isSearching={isSearching}
        searchError={searchError}
      />

      <BookBottomSheet
        sheetState={sheetState}
        selectedBook={selectedBook}
        saveError={saveError}
        onClose={() => setSheetState('closed')}
        onSetSheetState={setSheetState}
        onEvaluate={handleExecuteEvaluation}
        onSetFlag={handleSetFlag}
      />
    </div>
  );
}

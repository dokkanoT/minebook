'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { normalizeIsbn } from '@/lib/utils/isbn';

export type CameraStatus =
  | 'starting' // 起動中
  | 'scanning' // 読み取り中
  | 'insecure' // http（localhost 以外）で開いている
  | 'denied' // カメラの使用が許可されなかった
  | 'unavailable' // カメラがない
  | 'error';

// 何ミリ秒ごとに映像からバーコードを探すか
const SCAN_INTERVAL_MS = 200;
// 同じ本を映し続けている間は、この時間以上見えなくなるまで再通知しない
const SAME_ISBN_COOLDOWN_MS = 3000;

type Detector = {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
};

// ブラウザ内蔵の BarcodeDetector（TypeScript の型定義にはまだない）
type NativeBarcodeDetector = {
  new (options: { formats: string[] }): Detector;
  getSupportedFormats(): Promise<string[]>;
};

// Android の Chrome などは内蔵の BarcodeDetector を使う。
// iPhone の Safari などにはないので、ライブラリ（zxing の wasm 版）で代用する
async function createDetector(): Promise<Detector> {
  const Native = (globalThis as { BarcodeDetector?: NativeBarcodeDetector })
    .BarcodeDetector;
  if (Native) {
    const formats = await Native.getSupportedFormats().catch((): string[] => []);
    if (formats.includes('ean_13')) return new Native({ formats: ['ean_13'] });
  }
  const { BarcodeDetector } = await import('barcode-detector/ponyfill');
  return new BarcodeDetector({ formats: ['ean_13'] });
}

function statusFromError(error: unknown): CameraStatus {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'unavailable';
  }
  return 'error';
}

interface UseBarcodeScannerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** ISBN（978/979 で始まる 13 桁）を読み取ったときに呼ばれる */
  onDetect: (isbn: string) => void;
  torchOn: boolean;
}

// 背面カメラの映像を video に映し、ISBN のバーコードを読み取り続ける
export function useBarcodeScanner({
  videoRef,
  onDetect,
  torchOn,
}: UseBarcodeScannerOptions) {
  const [status, setStatus] = useState<CameraStatus>('starting');
  const [torchSupported, setTorchSupported] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // 読み取りループは作り直さず、常に最新の onDetect を呼ぶ
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  });

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let lastIsbn = '';
    let lastSeenAt = 0;

    const scanLoop = async (video: HTMLVideoElement, detector: Detector) => {
      if (cancelled) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          for (const { rawValue } of await detector.detect(video)) {
            // 下段のバーコード（192〜の価格コード）は ISBN ではないので null になる
            const isbn = normalizeIsbn(rawValue);
            if (!isbn) continue;

            const now = Date.now();
            const isSameBook =
              isbn === lastIsbn && now - lastSeenAt < SAME_ISBN_COOLDOWN_MS;
            lastIsbn = isbn;
            lastSeenAt = now;
            if (!isSameBook) onDetectRef.current(isbn);
            break;
          }
        } catch {
          // 1 フレームの読み取り失敗は無視して次のフレームへ
        }
      }

      if (!cancelled) {
        timer = window.setTimeout(() => scanLoop(video, detector), SCAN_INTERVAL_MS);
      }
    };

    const start = async () => {
      // カメラは https か localhost でしか使えない（スマホから Mac の IP に http でつなぐと使えない）
      if (!window.isSecureContext) return 'insecure';
      if (!navigator.mediaDevices?.getUserMedia) return 'unavailable';

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (error) {
        return statusFromError(error);
      }

      const video = videoRef.current;
      if (cancelled || !video) return null;

      video.srcObject = stream;
      await video.play().catch(() => {});

      const [track] = stream.getVideoTracks();
      trackRef.current = track;
      const capabilities = track.getCapabilities?.() as
        | (MediaTrackCapabilities & { torch?: boolean })
        | undefined;
      setTorchSupported(Boolean(capabilities?.torch));

      const detector = await createDetector().catch(() => null);
      if (!detector) return 'error';
      if (cancelled) return null;

      scanLoop(video, detector);
      return 'scanning';
    };

    start().then((next) => {
      if (!cancelled && next) setStatus(next);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
    };
  }, [videoRef]);

  // ライト（対応端末のみ。iPhone の Safari は非対応）
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !torchSupported) return;
    track
      .applyConstraints({ advanced: [{ torch: torchOn } as MediaTrackConstraintSet] })
      .catch(() => {});
  }, [torchOn, torchSupported]);

  return { status, torchSupported };
}

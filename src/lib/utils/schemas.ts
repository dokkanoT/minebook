import { z } from "zod";

// 複数の機能で使う入力スキーマ
export const idSchema = z.uuid("不正な ID です");

export const nameSchema = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(max, `${max}文字以内で入力してください`);

// 空文字は「未入力」として null にする
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}文字以内で入力してください`)
    .transform((v) => v || null)
    .nullish();

export const optionalYen = z
  .int("整数で入力してください")
  .min(0, "0以上で入力してください")
  .max(10_000_000, "金額が大きすぎます")
  .nullish();

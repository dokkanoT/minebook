/** 認証フォームで OAuth ボタンとメール入力フォームを区切る仕切り線 */
export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400 font-medium">または</span>
      </div>
    </div>
  );
}

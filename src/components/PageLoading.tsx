export function PageLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-village-border border-t-village-ember" />
      <p className="mt-4 text-sm text-village-ink/50">読み込み中...</p>
    </main>
  );
}

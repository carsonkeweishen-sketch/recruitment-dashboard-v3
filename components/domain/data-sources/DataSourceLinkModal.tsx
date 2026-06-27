"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataSourceLinkModal({ onClose, onLink }: { onClose: () => void; onLink: (data: any) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const sourceType = (form.querySelector("[name=sourceType]") as HTMLSelectElement).value;
    onLink({
      sourceType,
      sourceSystem: sourceType === "feishu_link" ? "feishu" : sourceType === "moka_link" ? "moka" : "external",
      externalUrl: (form.querySelector("[name=externalUrl]") as HTMLInputElement).value,
      objectType: (form.querySelector("[name=objectType]") as HTMLSelectElement).value,
      usageType: (form.querySelector("[name=usageType]") as HTMLSelectElement).value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold mb-4">导入链接</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select name="sourceType" required className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">选择来源</option>
            <option value="feishu_link">飞书链接 (需授权)</option>
            <option value="moka_link">Moka 链接 (未配置)</option>
            <option value="external_url">外部链接</option>
          </select>
          <input name="externalUrl" placeholder="链接地址" required className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]" />
          <select name="objectType" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">关联对象</option>
            <option value="job">岗位</option>
            <option value="candidate">候选人</option>
            <option value="interview">面试</option>
            <option value="offer_risk">Offer 风险</option>
          </select>
          <select name="usageType" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">资料用途</option>
            <option value="JD">JD</option>
            <option value="简历">简历</option>
            <option value="面试纪要">面试纪要</option>
            <option value="业务反馈">业务反馈</option>
            <option value="其他">其他</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)]">取消</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-white">导入</button>
          </div>
        </form>
      </div>
    </div>
  );
}

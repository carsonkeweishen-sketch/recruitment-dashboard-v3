"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataSourceUploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (data: any) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    onUpload({
      fileName: fd.get("fileName") as string,
      fileMimeType: fd.get("fileMimeType") as string,
      fileSize: 0,
      fileUrl: "",
      objectType: fd.get("objectType") as string,
      usageType: fd.get("usageType") as string,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold mb-4">上传资料</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="fileName" placeholder="文件名" required className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]" />
          <select name="fileMimeType" required className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">选择类型</option>
            <option value="application/pdf">PDF</option>
            <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
            <option value="text/plain">TXT</option>
            <option value="text/markdown">Markdown</option>
            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option>
            <option value="text/csv">CSV</option>
            <option value="image/png">PNG (OCR待实现)</option>
            <option value="audio/mpeg">MP3 (转写待实现)</option>
            <option value="video/mp4">MP4 (转写待实现)</option>
          </select>
          <select name="objectType" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">关联对象</option>
            <option value="job">岗位</option>
            <option value="candidate">候选人</option>
            <option value="interview">面试</option>
            <option value="offer_risk">Offer 风险</option>
            <option value="general_knowledge">通用知识</option>
          </select>
          <select name="usageType" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-[var(--color-surface)]">
            <option value="">资料用途</option>
            <option value="JD">JD</option>
            <option value="简历">简历</option>
            <option value="面试纪要">面试纪要</option>
            <option value="SOP">SOP</option>
            <option value="业务反馈">业务反馈</option>
            <option value="其他">其他</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)]">取消</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-white">上传</button>
          </div>
        </form>
      </div>
    </div>
  );
}

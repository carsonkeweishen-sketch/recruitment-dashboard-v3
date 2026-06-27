"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/ui/product-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { DataSourceCard } from "@/components/domain/data-sources/DataSourceCard";
import { DataSourceUploadModal } from "@/components/domain/data-sources/DataSourceUploadModal";
import { DataSourceLinkModal } from "@/components/domain/data-sources/DataSourceLinkModal";
import { DataSourceDrawer } from "@/components/domain/data-sources/DataSourceDrawer";
import { IntegrationStatusPanel } from "@/components/domain/data-sources/IntegrationStatusPanel";

export default function DataSourcesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/data-sources")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); else setError(d.error); })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (formData: any) => {
    await fetch("/api/data-sources/upload", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
    });
    setShowUpload(false);
    fetchData();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLink = async (formData: any) => {
    await fetch("/api/data-sources/link", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
    });
    setShowLink(false);
    fetchData();
  };

  if (error) return <ProductShell title="资料接入" description="统一管理岗位、候选人、面试、Offer 和外部系统资料"><ErrorState title="加载失败" description={error} onRetry={fetchData} /></ProductShell>;
  if (loading) return <ProductShell title="资料接入" description="统一管理岗位、候选人、面试、Offer 和外部系统资料"><LoadingSkeleton /></ProductShell>;

  const total = data?.length || 0;
  const parsed = data?.filter(d => d.parseStatus === "parsed").length || 0;
  const pending = data?.filter(d => d.parseStatus === "pending" || d.parseStatus === "parsing").length || 0;
  const mediaPending = data?.filter(d => d.parseStatus === "transcription_pending" || d.parseStatus === "unsupported_ocr_pending").length || 0;

  return (
    <ProductShell title="资料接入" description="统一管理岗位、候选人、面试、Offer 和外部系统资料，为 AI 分析提供可追溯的证据来源。">
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="资料总数" value={String(total)} />
          <KpiCard label="已解析" value={String(parsed)} />
          <KpiCard label="待解析" value={String(pending)} />
          <KpiCard label="音视频/OCR待实现" value={String(mediaPending)} />
        </div>

        <IntegrationStatusPanel />

        <div className="flex gap-3">
          <button onClick={() => setShowUpload(true)} className="rounded-lg bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium">📄 上传资料</button>
          <button onClick={() => setShowLink(true)} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium">🔗 导入链接</button>
        </div>

        {(!data || data.length === 0) ? (
          <EmptyState title="暂无资料" description="上传文件或导入链接，开始建立资料库。" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((source, i) => (
              <DataSourceCard key={i} source={source} onClick={() => setSelectedId(source.id)} />
            ))}
          </div>
        )}

        {showUpload && <DataSourceUploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
        {showLink && <DataSourceLinkModal onClose={() => setShowLink(false)} onLink={handleLink} />}
        {selectedId && <DataSourceDrawer sourceId={selectedId} onClose={() => setSelectedId(null)} />}
      </div>
    </ProductShell>
  );
}

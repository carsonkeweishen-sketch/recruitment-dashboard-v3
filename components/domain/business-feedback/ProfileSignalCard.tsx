"use client";

interface ProfileSignal {
  calibrationNeeded: boolean;
  topReasonCode: string | null;
  topReasonCount: number;
  rejectionRate: number;
  suggestedCalibrationReason: string | null;
}

const REASON_LABELS: Record<string, string> = {
  EXPERIENCE_MISMATCH: "经验不匹配", CAPABILITY_GAP: "能力不足", SENIORITY_MISMATCH: "资历不匹配",
  SALARY_GAP: "薪资差距", EXPECTATION_MISMATCH: "期望不匹配", COMMUNICATION_GAP: "沟通问题",
  STABILITY_RISK: "稳定性风险", CULTURE_MISMATCH: "文化不匹配", LOCATION_ISSUE: "地点问题", OTHER: "其他",
};

export function ProfileSignalCard({ signal, onCreateCalibration }: { signal: ProfileSignal | null; onCreateCalibration?: () => void }) {
  if (!signal) return null;

  return (
    <div className={`rounded-lg border p-4 ${signal.calibrationNeeded ? "border-amber-300 bg-amber-50" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">画像偏差信号</span>
            {signal.calibrationNeeded ? (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">需校准</span>
            ) : (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">正常</span>
            )}
          </div>
          <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
            {signal.topReasonCode && (
              <p>🔝 最高拒绝原因: {REASON_LABELS[signal.topReasonCode] || signal.topReasonCode}（{signal.topReasonCount}次）</p>
            )}
            <p>📊 业务拒绝率: {(signal.rejectionRate * 100).toFixed(0)}%</p>
          </div>
          {signal.suggestedCalibrationReason && (
            <p className="mt-2 text-sm font-medium text-amber-700">{signal.suggestedCalibrationReason}</p>
          )}
        </div>
        {signal.calibrationNeeded && onCreateCalibration && (
          <button onClick={onCreateCalibration} className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors">
            创建画像校准
          </button>
        )}
      </div>
    </div>
  );
}

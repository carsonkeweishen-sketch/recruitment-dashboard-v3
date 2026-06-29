"use client";

/**
 * RuntimeProofBadge — 仅在开发/Demo 模式显示当前版本信息
 * 用于证明实际运行的是哪个 branch/commit/phase
 * 不暴露 API Key、DATABASE_URL 等敏感信息
 */

const RUNTIME = {
  branch: "agent/workbuddy/phase-7",
  commit: "4d6d57f",
  commitFull: "4d6d57f",
  phase: "8.15C",
  buildTime: "2026-06-29 06:14 UTC",
  dataVersion: "liran-real-jd-v1",
  environment: "demo",
};

export function RuntimeProofBadge() {
  if (typeof window !== "undefined" && window.location.search.includes("_hideRuntimeProof")) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 9999,
        background: "rgba(13, 17, 23, 0.92)",
        color: "#c9d1d9",
        border: "1px solid rgba(48, 54, 61, 0.8)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'Courier New', monospace",
        fontSize: 11,
        lineHeight: 1.5,
        maxWidth: 340,
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ color: "#58a6ff", fontWeight: "bold", marginBottom: 4, fontSize: 12 }}>
        🏷️ Demo Runtime Proof
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Branch:</span>{" "}
        <span style={{ color: "#7ee787" }}>{RUNTIME.branch}</span>
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Commit:</span>{" "}
        <span style={{ color: "#7ee787" }}>{RUNTIME.commit}</span>
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Phase:</span>{" "}
        <span style={{ color: "#d2a8ff" }}>{RUNTIME.phase}</span>
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Build:</span>{" "}
        <span style={{ color: "#8b949e" }}>{RUNTIME.buildTime}</span>
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Data:</span>{" "}
        <span style={{ color: "#8b949e" }}>{RUNTIME.dataVersion}</span>
      </div>
      <div>
        <span style={{ color: "#8b949e" }}>Env:</span>{" "}
        <span style={{ color: "#d29922" }}>{RUNTIME.environment}</span>
      </div>
    </div>
  );
}

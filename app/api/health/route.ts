export async function GET() {
  return Response.json({
    success: true,
    data: {
      status: "ok",
      service: "recruitment-dashboard-v3",
      phase: "0",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
    },
  });
}

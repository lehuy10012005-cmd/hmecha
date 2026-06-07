"use client";

import { useEffect, useMemo, useState } from "react";

type DailyRow = {
  date: string;
  revenue: number;
  completedOrders: number;
  pendingRevenue: number;
  pendingOrders: number;
  expectedRevenue: number;
  expectedOrders: number;
  cancelledOrders: number;
};

type ReportData = {
  rangeDays: number;
  summary: {
    revenue: number;
    expectedRevenue: number;
    pendingRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  };
  daily: DailyRow[];
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return day + "/" + month + "/" + year;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(0,229,255,.2)",
  background:
    "radial-gradient(circle at 0% 0%, rgba(124,77,255,.14), transparent 34%), rgba(7,12,32,.84)",
  boxShadow: "0 18px 42px rgba(0,0,0,.22)",
};

const buttonStyle: React.CSSProperties = {
  minHeight: 44,
  border: 0,
  borderRadius: 13,
  padding: "0 16px",
  fontWeight: 950,
  cursor: "pointer",
  color: "#061020",
  background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
};

export default function AdminRevenueReportPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReport(nextDays = days) {
    setLoading(true);

    const response = await fetch(
      "/api/admin/reports/revenue?days=" + encodeURIComponent(nextDays),
      { cache: "no-store" }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Không tải được báo cáo.");
      setLoading(false);
      return;
    }

    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    loadReport(days);
  }, []);

  const maxRevenue = useMemo(() => {
    if (!data?.daily?.length) return 0;
    return Math.max(...data.daily.map((row) => row.revenue), 0);
  }, [data]);

  function changeRange(value: number) {
    setDays(value);
    loadReport(value);
  }

  return (
    <div style={{ color: "#fff", display: "grid", gap: 20 }}>
      <section style={{ ...cardStyle, borderRadius: 26, padding: 30 }}>
        <p
          style={{
            color: "#00e5ff",
            fontWeight: 950,
            letterSpacing: 4,
            margin: "0 0 8px",
          }}
        >
          HMECHA ADMIN
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(42px, 6vw, 68px)",
            lineHeight: 1.05,
          }}
        >
          Báo cáo doanh thu
        </h1>

        <p style={{ color: "#c5d2f2", margin: "14px 0 0" }}>
          Doanh thu thực nhận chỉ tính đơn có trạng thái <b>Hoàn thành</b>.
          Đơn <b>Chờ xác nhận</b> không được tính vào doanh thu.
        </p>
      </section>

      <section
        style={{
          ...cardStyle,
          borderRadius: 20,
          padding: 18,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <strong style={{ color: "#00e5ff", marginRight: 8 }}>Khoảng thời gian:</strong>

        {[7, 14, 30, 90].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => changeRange(value)}
            style={{
              ...buttonStyle,
              opacity: days === value ? 1 : 0.55,
            }}
          >
            {value} ngày
          </button>
        ))}

        <button type="button" onClick={() => loadReport(days)} style={buttonStyle}>
          Tải lại
        </button>
      </section>

      {loading || !data ? (
        <section style={{ ...cardStyle, borderRadius: 22, padding: 24 }}>
          Đang tải báo cáo...
        </section>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <StatCard
              label="Doanh thu thực nhận"
              value={money(data.summary.revenue)}
              note="Chỉ tính đơn Hoàn thành"
            />
            <StatCard
              label="Doanh thu dự kiến"
              value={money(data.summary.expectedRevenue)}
              note="Hoàn thành + đã xác nhận / đang giao"
            />
            <StatCard
              label="Đơn chờ xác nhận"
              value={String(data.summary.pendingOrders)}
              note={"Giá trị chờ: " + money(data.summary.pendingRevenue)}
            />
            <StatCard
              label="Giá trị đơn trung bình"
              value={money(data.summary.averageOrderValue)}
              note="Tính trên đơn Hoàn thành"
            />
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <StatCard
              label="Tổng đơn"
              value={String(data.summary.totalOrders)}
              note={"Trong " + data.rangeDays + " ngày"}
            />
            <StatCard
              label="Đơn hoàn thành"
              value={String(data.summary.completedOrders)}
              note="Được tính doanh thu"
            />
            <StatCard
              label="Đơn đang xử lý"
              value={String(data.summary.confirmedOrders)}
              note="Đã xác nhận / đang giao"
            />
            <StatCard
              label="Đơn hủy / lỗi"
              value={String(data.summary.cancelledOrders)}
              note="Không tính doanh thu"
            />
          </section>

          <section style={{ ...cardStyle, borderRadius: 24, padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 30 }}>Doanh thu theo ngày</h2>
                <p style={{ color: "#9fb0d8", margin: "8px 0 0" }}>
                  Cột xanh là doanh thu từ đơn Hoàn thành. Đơn Chờ xác nhận không tính.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(" + data.daily.length + ", minmax(26px, 1fr))",
                gap: 8,
                alignItems: "end",
                minHeight: 260,
                overflowX: "auto",
                paddingBottom: 12,
              }}
            >
              {data.daily.map((row) => {
                const height =
                  maxRevenue > 0 ? Math.max(8, Math.round((row.revenue / maxRevenue) * 220)) : 8;

                return (
                  <div
                    key={row.date}
                    title={formatDate(row.date) + ": " + money(row.revenue)}
                    style={{
                      display: "grid",
                      gap: 8,
                      justifyItems: "center",
                      alignItems: "end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        minWidth: 24,
                        height,
                        borderRadius: "10px 10px 4px 4px",
                        background:
                          row.revenue > 0
                            ? "linear-gradient(180deg,#00e5ff,#7c4dff)"
                            : "rgba(255,255,255,.08)",
                        boxShadow:
                          row.revenue > 0 ? "0 0 22px rgba(0,229,255,.18)" : "none",
                      }}
                    />
                    <small
                      style={{
                        color: "#9fb0d8",
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        height: 70,
                      }}
                    >
                      {formatDate(row.date)}
                    </small>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ ...cardStyle, borderRadius: 24, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.1fr 1fr 1.1fr 1fr",
                gap: 12,
                padding: "16px 18px",
                color: "#00e5ff",
                fontWeight: 950,
                borderBottom: "1px solid rgba(255,255,255,.1)",
              }}
            >
              <span>Ngày</span>
              <span>Doanh thu thực</span>
              <span>Đơn hoàn thành</span>
              <span>Doanh thu chờ xác nhận</span>
              <span>Đơn hủy/lỗi</span>
            </div>

            {data.daily
              .slice()
              .reverse()
              .map((row) => (
                <div
                  key={row.date}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.1fr 1fr 1.1fr 1fr",
                    gap: 12,
                    padding: "16px 18px",
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                    alignItems: "center",
                  }}
                >
                  <strong>{formatDate(row.date)}</strong>
                  <strong style={{ color: "#00e5ff" }}>{money(row.revenue)}</strong>
                  <span>{row.completedOrders}</span>
                  <span style={{ color: "#ffd166" }}>
                    {money(row.pendingRevenue)} · {row.pendingOrders} đơn
                  </span>
                  <span>{row.cancelledOrders}</span>
                </div>
              ))}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div style={{ ...cardStyle, borderRadius: 18, padding: 18 }}>
      <span style={{ color: "#9fb0d8" }}>{label}</span>
      <strong
        style={{
          display: "block",
          color: "#00e5ff",
          fontSize: 30,
          marginTop: 8,
          wordBreak: "break-word",
        }}
      >
        {value}
      </strong>
      <small style={{ color: "#c5d2f2" }}>{note}</small>
    </div>
  );
}

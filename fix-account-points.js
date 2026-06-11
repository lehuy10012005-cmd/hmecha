const fs = require("fs");

const path = "app/tai-khoan/page.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes("memberPoints")) {
  const marker = `const orders = (ordersData || []) as Order[];`;

  const insert = `const { data: pointRow } = await supabase
    .from("customer_points")
    .select("points,lifetime_points,lifetime_spent,completed_orders,completed_items,tier")
    .eq("user_id", user!.id)
    .maybeSingle();

  const memberPoints = Number(pointRow?.points || 0);
  const memberTier = pointRow?.tier || "Rookie Builder";

  `;

  text = text.replace(marker, insert + marker);
}

text = text.replace(
  `Cấp thành viên: Rookie Builder`,
  `Cấp thành viên: {memberTier}`
);

text = text.replace(
  `Điểm tích lũy: 0 điểm`,
  `Điểm tích lũy: {memberPoints} điểm`
);

fs.writeFileSync(path, text, "utf8");
console.log("Updated app/tai-khoan/page.tsx");
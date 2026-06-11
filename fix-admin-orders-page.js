const fs = require("fs");

const path = "app/admin/orders/page.tsx";
let text = fs.readFileSync(path, "utf8");

const oldBlock = `if (!response.ok) { alert("Lỗi cập nhật trạng thái: " + (result.message || "Không rõ lỗi.")); return; } loadOrders();`;

const newBlock = `if (!response.ok) { alert("Lỗi cập nhật trạng thái: " + (result.message || "Không rõ lỗi.")); return; } if (result.reward?.awarded) { alert(result.reward.message); } loadOrders();`;

if (text.includes(oldBlock)) {
  text = text.replace(oldBlock, newBlock);
} else if (!text.includes("result.reward?.awarded")) {
  text = text.replace(
    `if (!response.ok) { alert("Lỗi cập nhật trạng thái: " + (result.message || "Không rõ lỗi.")); return; }`,
    `if (!response.ok) { alert("Lỗi cập nhật trạng thái: " + (result.message || "Không rõ lỗi.")); return; } if (result.reward?.awarded) { alert(result.reward.message); }`
  );
}

fs.writeFileSync(path, text, "utf8");
console.log("Updated app/admin/orders/page.tsx");
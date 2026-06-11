const fs = require("fs");

const path = "app/tai-khoan/don-hang/[id]/page.tsx";
let text = fs.readFileSync(path, "utf8");

text = text.replace(
  '.eq("id", id).eq("customer_id", user.id).maybeSingle()',
  '.eq("id", id).or(`customer_id.eq.${user.id},customer_email.eq.${user.email || ""}`).maybeSingle()'
);

text = text.replace(
  '.eq("id", id).eq("customer_id", user!.id).maybeSingle()',
  '.eq("id", id).or(`customer_id.eq.${user!.id},customer_email.eq.${user!.email || ""}`).maybeSingle()'
);

fs.writeFileSync(path, text, "utf8");

console.log("Fixed order detail fallback by email.");
const fs = require("fs");

const path = "app/layout.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes('HomeCleanup')) {
  text = text.replace(
    'import ChatWidget from "@/components/ChatWidget";',
    'import ChatWidget from "@/components/ChatWidget";\nimport HomeCleanup from "@/components/HomeCleanup";'
  );
}

if (!text.includes('<HomeCleanup />')) {
  text = text.replace(
    '{children}',
    '<HomeCleanup />\n        {children}'
  );
}

fs.writeFileSync(path, text, "utf8");
console.log("Added HomeCleanup to layout.");
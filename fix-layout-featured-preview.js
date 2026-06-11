const fs = require("fs");

const path = "app/layout.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes("DisableFeaturedImagePreview")) {
  if (text.includes('import ChatWidget from "@/components/ChatWidget";')) {
    text = text.replace(
      'import ChatWidget from "@/components/ChatWidget";',
      'import ChatWidget from "@/components/ChatWidget";\nimport DisableFeaturedImagePreview from "@/components/DisableFeaturedImagePreview";'
    );
  } else {
    text = text.replace(
      'import "./globals.css";',
      'import "./globals.css";\nimport DisableFeaturedImagePreview from "@/components/DisableFeaturedImagePreview";'
    );
  }
}

if (!text.includes("<DisableFeaturedImagePreview />")) {
  if (text.includes("<ChatWidget />")) {
    text = text.replace(
      "<ChatWidget />",
      "<DisableFeaturedImagePreview />\n        <ChatWidget />"
    );
  } else {
    text = text.replace(
      "</body>",
      "        <DisableFeaturedImagePreview />\n      </body>"
    );
  }
}

fs.writeFileSync(path, text, "utf8");

console.log("Fixed app/layout.tsx safely.");
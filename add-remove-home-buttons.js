const fs = require("fs");

const path = "app/layout.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes("RemoveHomeExtraButtons")) {
  text = text.replace(
    'import ChatWidget from "@/components/ChatWidget";',
    'import ChatWidget from "@/components/ChatWidget";\nimport RemoveHomeExtraButtons from "@/components/RemoveHomeExtraButtons";'
  );
}

if (!text.includes("<RemoveHomeExtraButtons />")) {
  text = text.replace(
    "{children}",
    "<RemoveHomeExtraButtons />\n        {children}"
  );
}

fs.writeFileSync(path, text, "utf8");

console.log("Added RemoveHomeExtraButtons to layout.");
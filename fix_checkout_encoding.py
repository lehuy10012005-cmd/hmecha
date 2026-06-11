from pathlib import Path

path = Path("app/checkout/page.tsx")
text = path.read_text(encoding="utf-8")

def undo_mojibake(s: str) -> str:
    data = bytearray()

    for ch in s:
        code = ord(ch)

        if code <= 255:
            data.append(code)
        else:
            try:
                data.extend(ch.encode("cp1252"))
            except UnicodeEncodeError:
                data.extend(ch.encode("utf-8"))

    return data.decode("utf-8", errors="replace")

fixed = undo_mojibake(text)
path.write_text(fixed, encoding="utf-8")

print("Fixed encoding for app/checkout/page.tsx")

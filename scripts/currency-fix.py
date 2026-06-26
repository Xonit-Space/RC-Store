import os

SRC_DIR = "/Users/asithalakmal/Documents/web/RC Store/src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    content = content.replace("\\'currency\\'", "'currency'")
    content = content.replace("\\'AUD\\'", "'AUD'")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))

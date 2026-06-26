import os
import re

# Paths
SRC_DIR = "/Users/asithalakmal/Documents/web/RC Store/src"

# We want to replace instances of:
# 1. $ { variable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
#    with {formatCurrency(variable)}
# 2. $${ variable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
#    with ${formatCurrency(variable)}
# 3. $ { variable.toLocaleString() }
#    with {formatCurrency(variable)}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Regex 1: JSX curly brace formatting with hardcoded $
    # Example: $ {price.toLocaleString("en-US", ...)} or ${ price.toLocaleString(...) }
    # Let's match \$ \s* \{ \s* (.*?) \.toLocaleString\([^)]*\) \s* \}
    
    # We will match anything that looks like price.toLocaleString(...)
    # and if it is prefixed with $ or $$, we replace it.
    
    # First, let's just replace the exact "en-US" toLocaleString with formatCurrency logic if we want to use the helper.
    # Actually, importing the helper in 30 files automatically is hard.
    # Instead, we can just replace .toLocaleString("en-US", ...) with .toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})
    # AND remove the preceding $ signs!
    
    # Let's find $ { something.toLocaleString("en-US" ...) }
    # Or $${ something.toLocaleString("en-US" ...) }
    # And replace with { something.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'}) }
    
    # Match `$ {` or `$${` or `${` preceded by `$`
    # We'll use a regex that matches:
    # \$ \s* \{ \s* ( [^}]*? ) \.toLocaleString\( [^)]* \) \s* \}
    
    pattern_jsx = r'\$\s*\{\s*(.*?)\.toLocaleString\([^)]*\)\s*\}'
    # Replacement for JSX: { \1.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'}) }
    content = re.sub(pattern_jsx, r'{\1.toLocaleString("en-AU", {style: \'currency\', currency: \'AUD\'})}', content)
    
    # Match template literals: \$ \$\{ \s* ( [^}]*? ) \.toLocaleString\( [^)]* \) \s* \}
    pattern_template = r'\$\s*\$\{\s*(.*?)\.toLocaleString\([^)]*\)\s*\}'
    content = re.sub(pattern_template, r'${\1.toLocaleString("en-AU", {style: \'currency\', currency: \'AUD\'})}', content)

    # Some might be just `something.toLocaleString("en-US", ...)` without a `$` in front (e.g. if the $ was somewhere else)
    # We can just replace `"en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }` 
    # with `"en-AU", { style: 'currency', currency: 'AUD' }`
    
    content = content.replace(
        '"en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }',
        '"en-AU", { style: \'currency\', currency: \'AUD\' }'
    )
    content = content.replace(
        "'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }",
        "'en-AU', { style: 'currency', currency: 'AUD' }"
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))

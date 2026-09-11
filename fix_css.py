import re
with open("frontend/src/Landing.css", "r") as f:
    css = f.read()

# Replace bhoomi-card:hover block
css = re.sub(r'\.bhoomi-card:hover\s*\{[^}]*\}', 
             '.bhoomi-card:hover {\n  transform: translateY(-6px);\n  border-color: rgba(0, 155, 154, 0.4);\n  box-shadow: 0 16px 40px rgba(20, 33, 61, 0.08);\n}', 
             css, flags=re.MULTILINE|re.DOTALL)

# Remove the .old-hover-removed junk if it's there
css = re.sub(r'\.old-hover-removed \{[^}]*\}', '', css, flags=re.MULTILINE|re.DOTALL)
css = css.replace('.old-hover-removed {\n  transform: translateY(-2px);\n  border-color: #C2D1DF;\n  box-shadow: 0 10px 24px rgba(20, 33, 61, 0.06);\n}', '')

# Ensure transition on bhoomi-card is smooth
css = re.sub(r'\.bhoomi-card\s*\{[^}]*transition:[^;]+;', lambda m: m.group(0).replace('transition: all 0.3s ease', 'transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'), css)

with open("frontend/src/Landing.css", "w") as f:
    f.write(css)

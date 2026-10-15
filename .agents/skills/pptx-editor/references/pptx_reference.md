# python-pptx API Reference & Cheat Sheet

## Essential Imports
```python
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
```

## Opening & Saving
```python
prs = Presentation("template.pptx")
# Modify slides...
prs.save("output.pptx")
```

## Traversing Shapes
```python
for slide in prs.slides:
    for shape in slide.shapes:
        print(shape.name, shape.shape_type)
        if shape.has_text_frame:
            for p in shape.text_frame.paragraphs:
                for r in p.runs:
                    print(r.text, r.font.name, r.font.size, r.font.color.rgb)
        if shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    print(cell.text)
```

## Updating Text While Preserving Style
```python
def update_run_text(paragraph, old_str, new_str):
    for run in paragraph.runs:
        if old_str in run.text:
            run.text = run.text.replace(old_str, new_str)
```

## Modifying Tables
```python
table = shape.table
# Update cell
cell = table.cell(row_idx, col_idx)
cell.text = "New Value"
# Format text
p = cell.text_frame.paragraphs[0]
p.font.size = Pt(10)
p.font.name = "Inter"
```

## Inserting Images
```python
slide.shapes.add_picture(
    "image.png",
    left=Inches(1.5),
    top=Inches(2.0),
    width=Inches(6.0),
    height=Inches(4.0)
)
```

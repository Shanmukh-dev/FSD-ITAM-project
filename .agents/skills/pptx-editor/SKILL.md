---
name: pptx-editor
description: >-
  Comprehensive guide and automation runbook for inspecting, modifying,
  styling, and generating PowerPoint (.pptx) presentations using python-pptx
  and custom automation tooling. Use this skill whenever editing presentation slides,
  replacing placeholder text, updating tables, inserting screenshots or diagrams,
  formatting slide layouts, or executing batch presentation transformations.
---

# PPTX Editor Skill & Automation Runbook

This skill equips the agent with systematic procedures and automation tools to inspect, modify, style, and generate PowerPoint (`.pptx`) presentations using `python-pptx` and the companion CLI utility `pptx_tool.py`.

---

## Capabilities & Tooling

The primary automation engine is located at:
`~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py`

Supported operations:
1. **Inspection (`inspect`)**: Discovers total slides, dimensions, shape hierarchy, text frame contents, table layouts, and coordinates.
2. **Style-Preserving Text Replacement (`replace-text`)**: Swaps placeholder strings while maintaining font family, font size, bold/italic, color, and paragraph alignments.
3. **Table Updates**: Updates rows, cells, and headers with proper cell formatting and padding.
4. **Image & Diagram Insertion**: Inserts PNG/JPEG/SVG screenshots and diagrams into existing shape bounds or explicit slide coordinates (`left`, `top`, `width`, `height`).
5. **Batch Manifest Execution (`batch-edit`)**: Performs slide-by-slide text replacements, table updates, shape removals, and image insertions in a single atomic pass from a structured JSON manifest.

---

## Quick Reference CLI Commands

```bash
# 1. Inspect presentation structure and text
python ~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py inspect deck.pptx

# 2. Inspect with machine-readable JSON output
python ~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py inspect deck.pptx --json

# 3. Simple text replacement
python ~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py replace-text deck.pptx --mapping replacements.json --output updated_deck.pptx

# 4. Atomic batch modification from a manifest
python ~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py batch-edit deck.pptx --manifest manifest.json --output updated_deck.pptx
```

---

## Step-by-Step Presentation Transformation Workflow

### Step 1: Inspection & Shape Mapping
Always inspect the input PPTX first to identify slide count, shape names, and placeholder strings:
```bash
python ~/.gemini/config/skills/pptx-editor/scripts/pptx_tool.py inspect input.pptx --json > slides_audit.json
```

### Step 2: Coordinate & EMU Math
PowerPoint uses **English Metric Units (EMUs)** for dimensions:
- `1 inch = 914,400 EMUs`
- `1 cm = 360,000 EMUs`
- `1 pt = 12,700 EMUs`
- Standard 16:9 Widescreen: `13.33" x 7.5"` (`12,192,000 x 6,858,000 EMUs`)
- Standard 4:3 Aspect: `10.0" x 7.5"` (`9,144,000 x 6,858,000 EMUs`)

### Step 3: Text Run Replacement Caution
When modifying text in python-pptx, replacing `paragraph.text` resets character-level styling.
Always preserve runs or use `replace_text_preservative()` to retain existing formatting.

### Step 4: Batch Manifest Specification
Construct a JSON manifest for complex updates:
```json
{
  "global_replacements": {
    "OLD_FOOTER": "NEW_FOOTER"
  },
  "slides": {
    "1": {
      "text_replacements": {
        "Old Title": "New Title"
      },
      "shape_texts": {
        "Shape Name": ["Paragraph 1", "Paragraph 2"]
      }
    },
    "2": {
      "tables": [
        {
          "table_index": 0,
          "font_size": 10,
          "rows": [
            ["Header 1", "Header 2"],
            ["Value 1", "Value 2"]
          ]
        }
      ],
      "images": [
        {
          "path": "/absolute/path/to/diagram.png",
          "target_shape_name": "Placeholder Box",
          "remove_target_shape": true
        }
      ]
    }
  }
}
```

---

## References & Manuals
- API Cheatsheet: [pptx_reference.md](./references/pptx_reference.md)
- Design Guidelines: [design_patterns.md](./references/design_patterns.md)

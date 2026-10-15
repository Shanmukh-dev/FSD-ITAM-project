#!/usr/bin/env python3
"""
pptx_tool.py - Comprehensive CLI and automation engine for PowerPoint (.pptx) manipulation.
Supports slide inspection, style-preserving text replacement, table generation/updating,
shape-targeted image insertion, and atomic batch manifest execution.
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, List, Optional

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def hex_to_rgb(hex_str: str) -> RGBColor:
    hex_str = hex_str.lstrip('#')
    return RGBColor(*(int(hex_str[i:i+2], 16) for i in (0, 2, 4)))

def inspect_presentation(pptx_path: str, as_json: bool = False) -> None:
    prs = Presentation(pptx_path)
    slide_width = prs.slide_width
    slide_height = prs.slide_height
    
    summary = {
        "file": pptx_path,
        "slide_count": len(prs.slides),
        "dimensions": {
            "width_inches": slide_width / Inches(1),
            "height_inches": slide_height / Inches(1),
            "width_emu": slide_width,
            "height_emu": slide_height
        },
        "slides": []
    }

    for s_idx, slide in enumerate(prs.slides, start=1):
        s_data = {
            "slide_index": s_idx,
            "shapes": [],
            "tables": []
        }
        for shp_idx, shape in enumerate(slide.shapes):
            shp_info = {
                "index": shp_idx,
                "name": shape.name,
                "shape_type": str(shape.shape_type),
                "left": shape.left,
                "top": shape.top,
                "width": shape.width,
                "height": shape.height,
                "text": []
            }
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    p_text = "".join(r.text for r in p.runs) if p.runs else p.text
                    if p_text:
                        shp_info["text"].append(p_text)
            if shape.has_table:
                tbl = shape.table
                table_matrix = []
                for row in tbl.rows:
                    row_cells = []
                    for cell in row.cells:
                        row_cells.append(cell.text.strip())
                    table_matrix.append(row_cells)
                s_data["tables"].append({
                    "shape_name": shape.name,
                    "rows": len(tbl.rows),
                    "cols": len(tbl.columns),
                    "matrix": table_matrix
                })
            s_data["shapes"].append(shp_info)
        summary["slides"].append(s_data)

    if as_json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        print(f"Presentation: {pptx_path}")
        print(f"Total Slides: {summary['slide_count']} ({summary['dimensions']['width_inches']:.2f}\" x {summary['dimensions']['height_inches']:.2f}\")\n")
        for s in summary["slides"]:
            print(f"--- Slide {s['slide_index']} ---")
            for shp in s["shapes"]:
                if shp["text"]:
                    preview = " | ".join(shp["text"][:2])
                    print(f"  Shape [{shp['name']}]: {preview[:80]}")
            for t in s["tables"]:
                print(f"  Table [{t['shape_name']}]: {t['rows']}x{t['cols']} - Header: {t['matrix'][0] if t['matrix'] else []}")

def replace_text_in_paragraph(paragraph, old_text: str, new_text: str) -> bool:
    full_text = "".join(r.text for r in paragraph.runs) if paragraph.runs else paragraph.text
    if old_text not in full_text:
        return False

    if len(paragraph.runs) <= 1:
        if paragraph.runs:
            paragraph.runs[0].text = full_text.replace(old_text, new_text)
        else:
            paragraph.text = full_text.replace(old_text, new_text)
        return True

    # Multi-run match: replace in combined string while preserving first run's formatting
    updated = full_text.replace(old_text, new_text)
    first_run = paragraph.runs[0]
    first_run.text = updated
    for r in paragraph.runs[1:]:
        r.text = ""
    return True

def replace_text_preservative(pptx_path: str, mapping: Dict[str, str], output_path: str) -> int:
    prs = Presentation(pptx_path)
    replacements_made = 0

    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    for old_t, new_t in mapping.items():
                        if replace_text_in_paragraph(p, old_t, new_t):
                            replacements_made += 1
            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        for p in cell.text_frame.paragraphs:
                            for old_t, new_t in mapping.items():
                                if replace_text_in_paragraph(p, old_t, new_t):
                                    replacements_made += 1

    prs.save(output_path)
    return replacements_made

def update_table_content(table, rows_data: List[List[str]], font_size_pt: int = 11, header_bg_hex: Optional[str] = None):
    req_rows = len(rows_data)
    req_cols = max(len(r) for r in rows_data) if rows_data else 0

    # Fill existing cells
    for r_idx, row_values in enumerate(rows_data):
        if r_idx >= len(table.rows):
            break
        for c_idx, val in enumerate(row_values):
            if c_idx >= len(table.columns):
                break
            cell = table.cell(r_idx, c_idx)
            cell.text = str(val)
            for p in cell.text_frame.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(font_size_pt)
                    if r_idx == 0:
                        r.font.bold = True

def insert_image_into_shape_bounds(slide, shape, image_path: str):
    left = shape.left
    top = shape.top
    width = shape.width
    height = shape.height

    # Remove or hide text
    if shape.has_text_frame:
        shape.text_frame.text = ""

    # Add picture at exact bounding box
    pic = slide.shapes.add_picture(image_path, left, top, width, height)
    return pic

def execute_batch_manifest(pptx_path: str, manifest_path: str, output_path: str) -> None:
    prs = Presentation(pptx_path)
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    # Global text replacements
    global_replaces = manifest.get("global_replacements", {})
    if global_replaces:
        for slide in prs.slides:
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for p in shape.text_frame.paragraphs:
                        for old_t, new_t in global_replaces.items():
                            replace_text_in_paragraph(p, old_t, new_t)
                if shape.has_table:
                    for row in shape.table.rows:
                        for cell in row.cells:
                            for p in cell.text_frame.paragraphs:
                                for old_t, new_t in global_replaces.items():
                                    replace_text_in_paragraph(p, old_t, new_t)

    # Per-slide operations
    slide_ops = manifest.get("slides", {})
    for s_idx_str, ops in slide_ops.items():
        s_idx = int(s_idx_str)
        if s_idx < 1 or s_idx > len(prs.slides):
            print(f"Warning: Slide {s_idx} out of range (1-{len(prs.slides)})", file=sys.stderr)
            continue
        slide = prs.slides[s_idx - 1]

        # Slide-specific text replacements
        slide_text_replaces = ops.get("text_replacements", {})
        for old_t, new_t in slide_text_replaces.items():
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for p in shape.text_frame.paragraphs:
                        replace_text_in_paragraph(p, old_t, new_t)
                if shape.has_table:
                    for row in shape.table.rows:
                        for cell in row.cells:
                            for p in cell.text_frame.paragraphs:
                                replace_text_in_paragraph(p, old_t, new_t)

        # Shape text assignments by shape name
        shape_texts = ops.get("shape_texts", {})
        for shp_name, text_val in shape_texts.items():
            for shape in slide.shapes:
                if shape.name == shp_name and shape.has_text_frame:
                    # Clear paragraphs and set text
                    tf = shape.text_frame
                    if isinstance(text_val, list):
                        tf.text = ""
                        for idx, item in enumerate(text_val):
                            p = tf.add_paragraph() if idx > 0 else tf.paragraphs[0]
                            p.text = str(item)
                    else:
                        tf.text = str(text_val)

        # Tables update
        tables_update = ops.get("tables", [])
        for t_spec in tables_update:
            t_idx = t_spec.get("table_index", 0)
            t_data = t_spec.get("rows", [])
            f_size = t_spec.get("font_size", 10)
            found_tables = [sh.table for sh in slide.shapes if sh.has_table]
            if t_idx < len(found_tables):
                update_table_content(found_tables[t_idx], t_data, font_size_pt=f_size)

        # Images insertion into specific shape names or coordinates
        images_insert = ops.get("images", [])
        for img_spec in images_insert:
            img_path = img_spec["path"]
            if not os.path.isabs(img_path):
                img_path = os.path.abspath(img_path)
            if not os.path.exists(img_path):
                print(f"Warning: Image file not found: {img_path}", file=sys.stderr)
                continue

            target_shape_name = img_spec.get("target_shape_name")
            if target_shape_name:
                matched_shape = None
                for sh in slide.shapes:
                    if sh.name == target_shape_name:
                        matched_shape = sh
                        break
                if matched_shape:
                    insert_image_into_shape_bounds(slide, matched_shape, img_path)
                    # If remove_shape is requested
                    if img_spec.get("remove_target_shape", False):
                        sp_elem = matched_shape._element
                        sp_elem.getparent().remove(sp_elem)
            elif "coords" in img_spec:
                c = img_spec["coords"]
                slide.shapes.add_picture(
                    img_path,
                    Emu(c["left"]),
                    Emu(c["top"]),
                    Emu(c["width"]),
                    Emu(c["height"])
                )

    prs.save(output_path)
    print(f"Successfully processed manifest and saved to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="pptx_tool - PPTX Inspection & Manipulation Tool")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # Inspect
    inspect_parser = subparsers.add_parser("inspect", help="Inspect PPTX structure")
    inspect_parser.add_argument("file", help="Path to PPTX file")
    inspect_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # Replace Text
    rep_parser = subparsers.add_parser("replace-text", help="Replace text strings across presentation")
    rep_parser.add_argument("file", help="Path to input PPTX file")
    rep_parser.add_argument("--mapping", required=True, help="Path to JSON file with {old: new} pairs")
    rep_parser.add_argument("--output", required=True, help="Path to output PPTX file")

    # Batch Edit
    batch_parser = subparsers.add_parser("batch-edit", help="Execute complete batch editing manifest")
    batch_parser.add_argument("file", help="Path to input PPTX file")
    batch_parser.add_argument("--manifest", required=True, help="Path to manifest JSON file")
    batch_parser.add_argument("--output", required=True, help="Path to output PPTX file")

    args = parser.parse_args()

    if args.subcommand == "inspect":
        inspect_presentation(args.file, as_json=args.json)
    elif args.subcommand == "replace-text":
        with open(args.mapping, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
        count = replace_text_preservative(args.file, mapping, args.output)
        print(f"Completed {count} replacements. Saved to {args.output}")
    elif args.subcommand == "batch-edit":
        execute_batch_manifest(args.file, args.manifest, args.output)

if __name__ == "__main__":
    main()

# UI Style Guide

## Goal
Create a modern, clean, minimalist, and easy-to-use interface across the site.

## Core Principles
- **Clarity first**: prioritize readability and quick scanning over decoration.
- **Minimal palette**: use a restrained dark-neutral base with one accent and one error color.
- **Consistent controls**: buttons, spacing, and typography should behave predictably.
- **Action visibility**: selected, active, and error states must be immediately recognizable.
- **Low visual noise**: use subtle borders and hover states instead of heavy effects.

## Color Tokens
- `--color-bg`: primary page background
- `--color-surface`, `--color-surface-alt`: panels and controls
- `--color-border`: default borders
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`: text hierarchy
- `--color-accent`: active/interactive highlight
- `--color-danger`: invalid/error feedback

## Sudoku Application Rules
- Use shared color tokens in the Sudoku UI instead of ad-hoc bright hex values.
- Keep grid and control styling simple with moderate contrast.
- Keep feedback states clear:
  - selected cell: accent tint
  - error cell/value: danger tint
  - given numbers: strong primary text
  - notes/candidates: lower emphasis than final values

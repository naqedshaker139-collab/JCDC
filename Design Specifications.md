# Design Specifications

This document outlines the detailed design specifications for the equipment management website, including color schemes, typography, and visual elements.

## Color Palette

Based on the research of professional construction and railway websites, the following color palette will be used:

### Primary Colors
- **Primary Blue**: #2E5A87 (Professional, trustworthy, corporate)
- **Secondary Orange**: #FF8C00 (Construction industry standard, high visibility)
- **Accent Green**: #4CAF50 (Success states, available equipment)

### Supporting Colors
- **Background Gray**: #F5F5F5 (Clean, neutral background)
- **Text Dark**: #333333 (High contrast for readability)
- **Text Light**: #666666 (Secondary text)
- **Warning Red**: #F44336 (Alerts, unavailable equipment)
- **White**: #FFFFFF (Cards, modals, clean sections)

## Typography

### Font Selection
- **Primary Font**: "Roboto" (Google Fonts) - Excellent multilingual support including Arabic
- **Fallback Fonts**: Arial, sans-serif

### Font Sizes
- **Headings H1**: 32px (Mobile: 28px)
- **Headings H2**: 24px (Mobile: 22px)
- **Headings H3**: 20px (Mobile: 18px)
- **Body Text**: 16px (Mobile: 16px)
- **Small Text**: 14px (Mobile: 14px)
- **Button Text**: 16px (Mobile: 16px)

## Layout Specifications

### Grid System
- **Desktop**: 12-column grid with 1200px max-width
- **Tablet**: 8-column grid with 768px max-width
- **Mobile**: 4-column grid with 100% width

### Spacing
- **Section Padding**: 60px (Mobile: 30px)
- **Card Padding**: 24px (Mobile: 16px)
- **Button Padding**: 12px 24px (Mobile: 10px 20px)
- **Element Margins**: 16px standard spacing

### Component Specifications

#### Navigation Bar
- Height: 70px
- Background: Primary Blue (#2E5A87)
- Text: White
- Logo placement: Left side
- Language switcher: Right side

#### Cards
- Background: White
- Border Radius: 8px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Padding: 24px

#### Buttons
- Primary Button: Orange background (#FF8C00), white text
- Secondary Button: White background, Primary Blue border and text
- Border Radius: 6px
- Hover Effects: Slight color darkening and subtle shadow

#### Tables
- Header Background: Light gray (#F8F9FA)
- Row Striping: Alternating white and very light gray
- Border: 1px solid #E0E0E0

## Responsive Design Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px

## Multilingual Considerations

### Arabic Language Support
- Right-to-left (RTL) layout support
- Arabic font rendering with proper character spacing
- Mirrored navigation and layout elements for RTL
- Date and number formatting for Arabic locale

### Language Switcher
- Prominent placement in header
- Flag icons combined with text labels
- Smooth transition between languages
- Persistent language preference storage

## Accessibility Features

- High contrast color combinations (WCAG AA compliant)
- Large touch targets (minimum 44px)
- Clear focus indicators
- Screen reader friendly markup
- Keyboard navigation support


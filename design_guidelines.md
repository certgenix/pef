# PEF Platform Design Guidelines

## Design Approach
**Reference-Based**: Professional LinkedIn meets investment platform aesthetic - modern, corporate, trustworthy with global reach.

## Core Design Elements

### Typography
- **Headings**: Bold, modern sans-serif (Montserrat or Inter Bold)
- **Body**: Clean, readable sans-serif (Inter or Open Sans Regular)
- **Hierarchy**: 
  - Hero headline: Very large, bold white text
  - Section titles: Large, bold
  - Subheadings: Medium weight
  - Body: Regular, highly readable
- **Multi-language support**: Clear font rendering for English, Arabic, and Urdu

### Color Scheme
- **Primary**: Navy blue (#1e3c72)
- **Secondary**: Light blue (#4fc3f7)
- **Accent**: Orange/Gold (#ff9800) for CTAs
- **Text**: Dark gray (#333333)
- **Backgrounds**: White and Light gray (#f5f5f5)
- **Footer**: Dark navy background with light gray/white text

### Layout System
Use Tailwind spacing: p-2, p-4, p-8, p-12, p-16, p-20 for consistent rhythm. Generous whitespace between sections (py-16 to py-24 desktop, py-12 mobile).

## Component Library

### Header/Navigation
- Fixed position with gradient blue background (navy to lighter blue)
- Logo: "PEF" with globe/network icon
- Full navigation: Home, About, Membership, Opportunities, News, Contact
- Language selector dropdown (top right) with flag icons for English/Arabic/Urdu
- "Join Now" button in orange/gold accent
- Mobile: Hamburger menu, all touch targets minimum 44px
- Scroll effect: Header becomes slightly transparent on scroll

### Hero Section
- Full-width professional office/handshake background image with blue overlay
- Main headline: "A Global Platform Connecting Talent, Capital, and Opportunity"
- Subheadline below with supporting text
- Two prominent buttons: Primary "Join the Forum" (orange/gold), Secondary "Explore Opportunities" (white outline with backdrop blur)
- Animated stats counter showing member count, opportunities posted, countries served
- Subtle floating icons representing 5 user types
- Parallax scrolling effect on background

### Five Roles Section
- Section title: "Who We Serve"
- Five cards in responsive grid (1 col mobile, 2-3 cols tablet, 5 cols desktop)
- Each card: Icon, title, brief description (visible on hover)
- Color coding: Professional-blue, Job Seeker-green, Employer-purple, Business Owner-orange, Investor-gold
- Hover: Cards lift with shadow, reveal description
- Background: Light gray (#f5f5f5) with subtle geometric pattern

### Platform Benefits Section
- Split layout: Text content left, animated graphic/illustration right
- Benefits list with animated checkmarks for: Global Reach, One Profile Multiple Roles, Verified Membership, Structured Opportunities, Engaging Content
- Icons slide in from right on scroll
- Background: White with subtle geometric patterns

### How It Works Section
- Timeline design with 5 steps: Register, Complete Profile, Review & Approval, Access Opportunities, Stay Informed
- Animated progress line connecting steps
- Icons for each step animate on scroll
- Background: Light blue gradient

### Global Reach Section
- Interactive world map (stylized, not detailed)
- Country flags displayed: Saudi Arabia, Canada, UK, Germany, Italy
- Animated statistics counters for members per country
- Hover effects: Countries highlight on hover
- Background: White or light gray

### Call-to-Action Section
- Bold centered headline: "Join Today"
- Supporting description
- Large Join button with subtle arrow animation
- Background: Dark blue (#1e3c72) with network pattern overlay
- Full width, generous padding

### Footer
- Multi-column layout (4 columns desktop, stacked mobile):
  - Company info and logo
  - Quick links
  - Contact information
  - Social media icons and language selector
- Background: Dark navy
- Text: Light gray/white
- Minimum padding top/bottom: py-16

## Animations
- Fade-in effects for sections on scroll (subtle, not aggressive)
- Parallax scrolling for hero background
- Hover animations: All cards lift with shadow, all buttons have subtle scale/color transitions
- Counter animations: Statistics count up when section enters viewport
- Pulse effects on primary CTA buttons (subtle, continuous)
- All transitions: Smooth, 300-400ms duration

## Images
- **Hero Section**: Large professional office/handshake image with blue overlay (#1e3c72 at 60% opacity)
- **Platform Benefits**: Illustrative graphic showing global connectivity or network nodes
- **Global Reach**: Stylized world map with highlighted countries
- **Opportunity Cards**: Relevant professional imagery or keep minimal with icons

## Mobile Responsiveness
- Breakpoints: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- Hamburger menu replaces full navigation
- All grids stack to single column on mobile
- Touch-friendly buttons (minimum 44px height/width)
- Simplified animations for performance
- Hero section maintains impact but adjusts padding/text sizes
- Stats counters stack vertically
- Map interaction simplified for touch

## Page-Specific Guidelines
All internal pages (About, Membership, Opportunities, News, Contact) maintain:
- Same header/footer structure
- Consistent color scheme and typography
- Professional, clean layouts with clear information hierarchy
- Contact forms with validation feedback
- Opportunity boards with filterable card layouts
import re
import bleach
from bleach.css_sanitizer import CSSSanitizer

# Allowed HTML tags for formatted poems, shayari stanzas, and reflections
ALLOWED_TAGS = [
    'p', 'br', 'em', 'strong', 'i', 'b', 'u', 'blockquote',
    'span', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'hr'
]

ALLOWED_ATTRIBUTES = {
    'span': ['class', 'style'],
    'p': ['class', 'style'],
    'blockquote': ['class'],
}

css_sanitizer = CSSSanitizer(allowed_css_properties=['text-align', 'font-style', 'font-weight', 'color'])

def sanitize_html(content: str) -> str:
    """
    Sanitizes user-provided HTML content to prevent stored XSS attacks
    while preserving poem typography and stanzas.
    """
    if not content:
        return ""
    
    # Pre-strip all script and style blocks entirely including inner text
    cleaned_pre = re.sub(r'<(script|style)\b[^>]*>[\s\S]*?<\/\1>', '', content, flags=re.IGNORECASE)
    cleaned_pre = re.sub(r'<script\b[^>]*>', '', cleaned_pre, flags=re.IGNORECASE)
    
    cleaned = bleach.clean(
        cleaned_pre,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        css_sanitizer=css_sanitizer,
        strip=True
    )
    return cleaned.strip()

def strip_tags(content: str) -> str:
    """Strips all HTML tags to create safe excerpts or word counts."""
    if not content:
        return ""
    return bleach.clean(content, tags=[], strip=True).strip()

/**
 * @fileoverview XSS Sanitizer for AI-generated content.
 *
 * All text from Gemini is passed through this sanitizer before being rendered
 * in the DOM. Prevents script injection, attribute injection, and CSS injection.
 *
 * @module utils/xss-sanitizer
 * @see {@link https://owasp.org/www-community/attacks/xss/}
 */

// ─── Allowlists ───────────────────────────────────────────────────────────────

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'hr', 'span',
  'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  '*': new Set(['class', 'id', 'aria-label', 'aria-describedby', 'role']),
};

const DANGEROUS_PROTOCOLS = /^(javascript:|vbscript:|data:|blob:)/i;
const DANGEROUS_ATTRS = /^(on\w+|srcdoc|formaction|action|xlink:href)/i;

// ─── Core Sanitizer ───────────────────────────────────────────────────────────

/**
 * Sanitizes an HTML string by stripping disallowed tags and attributes.
 * Safe to use with `dangerouslySetInnerHTML` after calling this function.
 *
 * @param html - Raw HTML string (e.g. from Gemini response rendered as markdown)
 * @returns Sanitized HTML string safe for DOM injection
 *
 * @example
 * const safeHtml = sanitizeAIHtml('<p>Hello <script>alert(1)</script></p>');
 * // '<p>Hello </p>'
 */
export function sanitizeAIHtml(html: string): string {
  if (typeof html !== 'string') return '';

  // Strip script/style blocks entirely (content is dangerous too)
  let sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Process remaining tags
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();

    // Strip disallowed tags entirely (keep content)
    if (!ALLOWED_TAGS.has(tag)) return '';

    // For closing tags, allow them if the tag is allowed
    if (match.startsWith('</')) return `</${tag}>`;

    // Parse and filter attributes
    const attrs = parseAttributes(match);
    const safeAttrs = filterAttributes(tag, attrs);
    const attrStr = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';

    // Self-closing tags
    const selfClosing = new Set(['br', 'hr', 'img']);
    return selfClosing.has(tag) ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
  });

  return sanitized;
}

/**
 * Strips ALL HTML tags, returning only the plain text content.
 * Use this for text that should never contain HTML (e.g., toast notifications).
 */
export function stripAllHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z]+;/g, (e) => {
    const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
    return entities[e] ?? e;
  });
}

/**
 * Escapes special characters to their HTML entity equivalents.
 * Use for injecting plain text into an HTML context.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAttributes(tag: string): Array<[string, string]> {
  const attrs: Array<[string, string]> = [];
  const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"| '([^']*)'|([^\s>]*)))?/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attrs.push([name, value]);
  }
  return attrs;
}

function filterAttributes(tag: string, attrs: Array<[string, string]>): string[] {
  const allowed = new Set([
    ...(ALLOWED_ATTRIBUTES[tag] ?? []),
    ...(ALLOWED_ATTRIBUTES['*'] ?? []),
  ]);
  return attrs
    .filter(([name, value]) => {
      if (DANGEROUS_ATTRS.test(name)) return false;
      if (!allowed.has(name)) return false;
      if (name === 'href' && DANGEROUS_PROTOCOLS.test(value)) return false;
      return true;
    })
    .map(([name, value]) => {
      // Force external links to open safely
      if (name === 'href' && value.startsWith('http')) {
        return `href="${value}" target="_blank" rel="noopener noreferrer"`;
      }
      return `${name}="${escapeHtml(value)}"`;
    });
}

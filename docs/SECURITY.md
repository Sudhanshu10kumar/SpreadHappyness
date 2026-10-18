# Verseora Security Specification & Threat Model

## 1. Authentication & Password Security
- **Argon2id Hashing**: Passwords are saved using Argon2id (`time_cost=3, memory_cost=65536, parallelism=4, hash_len=32`).
- **Session Tokens**: JWT signed with HS256 (or RS256 in clustered deployments).
- **Dual Session Mechanism**: Supports both `Authorization: Bearer <token>` for SPA client states and `HttpOnly; SameSite=Lax; Secure` cookies for defense-in-depth against client script exfiltration.

## 2. Insecure Direct Object Reference (IDOR) Mitigations
- In `PostService.update_post` and `PostService.delete_post`:
  ```python
  if post.author_id != author.id and author.role != UserRole.ADMIN:
      raise HTTPException(status_code=403, detail="Not authorized to edit this post.")
  ```
- In `CollectionService`:
  ```python
  if not collection.is_public and (not current_user or current_user.id != collection.user_id):
      raise HTTPException(status_code=404, detail="Collection not found.")
  ```

## 3. Stored XSS Neutralization
- Content passed to poetry and comments is pre-filtered to strip all `<script>` and `<style>` blocks and attributes.
- Bleach sanitization enforces a strict tag allowlist: `p, br, em, strong, i, b, u, blockquote, span, h1, h2, h3, h4, ul, ol, li, hr`. All JavaScript event handlers (`onclick`, `onerror`, `onload`) and arbitrary attributes are stripped out before database persistence.

## 4. OWASP Response Headers Middleware
The FastAPI application injects the following security headers onto every HTTP response:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

## 5. Privacy & GDPR Compliance
- **Data Portability**: `GET /api/v1/export/my-data` packages the user's complete profile, private drafts, published works, and collections into a portable JSON download.
- **Permanent Account Deletion**: `DELETE /api/v1/users/profile/delete-account` cascades deletion of personal data and comments after verifying the current user's password.


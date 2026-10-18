# Verseora REST API Reference (v1)

Base URL: `/api/v1`

Interactive Swagger UI: `http://localhost:8000/docs`
OpenAPI JSON Specification: `http://localhost:8000/api/v1/openapi.json`

## Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new creator/reader account | None |
| `POST` | `/auth/login` | Authenticate with username/email & password | None |
| `POST` | `/auth/logout` | Invalidate cookie session | None |
| `GET` | `/auth/me` | Fetch authenticated account profile | Bearer Token / Cookie |

## Writing & Posts (`/posts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/posts/` | Create draft (defaults to private draft) | User |
| `GET` | `/posts/feed` | Public feed with sort, mood, language filters | None |
| `GET` | `/posts/drafts` | Fetch author's personal unpublished drafts | User |
| `GET` | `/posts/{id_or_slug}` | View poem reading view (enforces privacy) | Optional |
| `PUT` | `/posts/{post_id}` | Edit title, content, or change visibility | Author / Admin |
| `DELETE` | `/posts/{post_id}` | Permanently delete post | Author / Admin |
| `GET` | `/posts/{post_id}/versions` | View revision snapshots | Author / Admin |

## Social Engagements (`/social`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/social/posts/{id}/like` | Toggle like (atomic counter) | User |
| `POST` | `/social/posts/{id}/bookmark` | Toggle personal bookmark | User |
| `POST` | `/social/users/{id}/follow` | Follow / unfollow poet | User |
| `POST` | `/social/posts/{id}/comments` | Post sanitized comment on poem | User |
| `GET` | `/social/posts/{id}/comments` | Retrieve poem discussion comments | None |
| `GET` | `/social/bookmarks` | Retrieve user's saved bookmarks | User |

## Collections (`/collections`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/collections/` | Create named private/public collection | User |
| `GET` | `/collections/` | List collections for user | Optional |
| `GET` | `/collections/{id}` | View collection items (privacy enforced) | Optional |
| `POST` | `/collections/{id}/items/{post_id}` | Add poem to collection | Owner |
| `DELETE` | `/collections/{id}/items/{post_id}` | Remove poem from collection | Owner |

## Moderation & Admin (`/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/reports` | Submit harassment/plagiarism report | User |
| `GET` | `/admin/reports` | Review reports queue | Admin |
| `POST` | `/admin/reports/{id}/resolve` | Resolve or dismiss report | Admin |
| `POST` | `/admin/actions` | Enforce punitive moderation action | Admin |
| `GET` | `/admin/audit-logs` | Retrieve immutable audit trail | Admin |

## Data Portability & GDPR (`/export`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/export/my-data` | Export complete JSON archive of user account | User |


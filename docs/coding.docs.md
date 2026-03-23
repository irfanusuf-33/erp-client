# 🧑‍💻 Coding Guidelines

This document defines the coding standards and best practices for the ERP system. Following these guidelines ensures consistency, scalability, and maintainability across the project.

---

## 📌 General Principles

* Write **clean, readable, and maintainable code**
* Prefer **composition over complexity**
* Keep functions **small and focused**
* Avoid premature optimization
* Follow consistent naming and structure

---

## 📁 Folder & File Conventions

* Use **kebab-case** for folders

  ```
  user-profile/
  auth-service/
  ```

* Use **camelCase** for variables and functions

  ```
  getUserData()
  isAuthenticated
  ```

* Use **PascalCase** for components and types

  ```
  UserCard.tsx
  AuthSlice
  ```

---

## ⚛️ React / Next.js Guidelines

* Use **functional components only**
* Prefer **server components** where possible
* Use `"use client"` only when necessary
* Keep components **small and reusable**
* Avoid deeply nested JSX

### ✅ Example

```tsx id="ex1"
export function UserCard({ user }) {
  return <div>{user.name}</div>;
}
```

---

## 🎨 Styling Guidelines (Tailwind)

* Use **Tailwind CSS utility classes**
* Avoid inline styles unless necessary
* Group classes logically:

  * Layout → Spacing → Typography → Colors

### ✅ Example

```tsx id="ex2"
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
```

* Use `cn()` helper for conditional classes

```tsx id="ex3"
<div className={cn("p-4", isActive && "bg-blue-500")} />
```

---

## 🧩 UI Components (shadcn)

* Prefer **shadcn/ui components** first
* Customize using Tailwind
* Do NOT modify external libraries — components are local

---

## 🧠 State Management (Zustand)

* Use **slice pattern**
* Keep global state minimal
* Avoid putting everything in global store

### Rules:

* UI state → local component state
* Shared state → Zustand
* Server data → fetch/API layer

---

## 🔐 Authentication & Security

* Never store sensitive data in plain text
* Use secure token handling
* Validate inputs on both client and server

---

## 🌐 API Handling

* Centralize API calls (e.g., `/lib/axiosInstance.ts`)
* Handle errors gracefully
* Use consistent response handling

---

## 🧪 Error Handling

* Use try/catch for async operations
* Show user-friendly error messages
* Log errors for debugging

---

## 🧼 Code Cleanliness

* Remove unused code and imports
* Avoid console logs in production
* Keep files under reasonable size (~200–300 lines)

---

## 📦 Imports

* Use absolute imports (`@/components/...`)
* Group imports:

  1. External libs
  2. Internal modules
  3. Styles

---

## 🚫 Avoid

* Large monolithic components
* Hardcoded values (use constants/config)
* Deep prop drilling (use context/store if needed)
* Mixing business logic with UI

---

## 🚀 Best Practices

* Write reusable components
* Use TypeScript properly (avoid `any`)
* Keep logic separated from UI
* Follow DRY (Don’t Repeat Yourself)

---

## 📖 Documentation

* Add comments for complex logic
* Keep documentation updated with changes

---

## 🏁 Final Note

Consistency is more important than perfection.
Follow these guidelines across the project to maintain a scalable and clean ERP system.

---

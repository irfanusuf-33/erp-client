# ERP System (Next.js + shadcn/ui + Tailwind)

## 🚀 Overview

This is a modern ERP (Enterprise Resource Planning) system built using:

* Next.js (App Router)
* Tailwind CSS
* shadcn/ui (component system)
* Radix UI (accessible primitives)

The project provides a scalable foundation for building a full ERP platform with multiple modules like IAM, HRM, CRM, Accounts, Calendar, and Ticketing.

---

## 🧱 Tech Stack

* **Frontend Framework:** Next.js
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **Icons:** lucide-react
* **Headless UI:** Radix UI

---

## 📦 Features

* Modular ERP dashboard
* Clean and responsive UI
* Reusable component-based architecture
* Ready for multi-tenant expansion
* Easily customizable design system

---

## 📁 Project Structure

```
/app
  /dashboard        → Main ERP dashboard
  /hrm              → HRM module
  /crm              → CRM module
  /iam              → Identity & Access
  /accounts         → Finance module
  /calendar         → Scheduling
  /ticketing        → Support system

/components
  /ui               → shadcn components

/lib
  utils.ts          → helper functions
```

---

## ⚙️ Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🧩 Adding Components

Use shadcn CLI to add UI components:

```bash
npx shadcn@latest add button card dialog input
```

---

## 🎨 Customization

* Modify `globals.css` for theme variables
* Update Tailwind config for design tokens
* Customize components inside `/components/ui`

---

## 🔐 Modules

* **IAM** → User roles, permissions, authentication
* **HRM** → Employees, attendance, payroll
* **CRM** → Leads, customers, deals
* **Accounts** → Billing, invoices, reports
* **Calendar** → Events and scheduling
* **Ticketing** → Support and issue tracking

---

## 🚀 Future Improvements

* Role-based access control (RBAC)
* API integration (.NET / Node backend)
* Real-time notifications
* Analytics dashboard
* Multi-tenant architecture

---

## 🧑‍💻 Development Notes

* shadcn components are locally editable
* Radix is used under the hood for accessibility
* Keep UI consistent using design tokens

---

## 📄 License

This project is for internal or learning purposes. Add a proper license if deploying publicly.

---

## 🤝 Contributing

Contributions, ideas, and improvements are welcome.

---

## 📬 Contact

For any queries or collaboration, feel free to reach out.

---

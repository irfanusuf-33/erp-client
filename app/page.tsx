import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Shield, Calendar, Briefcase, DollarSign, Ticket, Package } from "lucide-react";

const modules = [
  { name: "IAM", desc: "Identity & Access Management", icon: Shield, href: "/iam" },
  { name: "HRM", desc: "Human Resource Management", icon: Users, href: "/hrm" },
  { name: "CRM", desc: "Customer Relationship Management", icon: Briefcase, href: "/crm" },
  { name: "Calendar", desc: "Events & Scheduling", icon: Calendar, href: "/calendar" },
  { name: "Accounts", desc: "Finance & Billing", icon: DollarSign, href: "/accounts" },
  { name: "Ticketing", desc: "Support & Issues", icon: Ticket, href: "/ticketing" },
  { name: "Inventory", desc: "Inventory Management", icon: Package, href: "/inventory" },
];

export default function Dashboard() {





  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ERP Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, manage your system efficiently
          </p>
        </div>

        <Button>+ Create</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$100</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.name} className="cursor-pointer hover:shadow-lg transition">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <CardTitle>{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{module.desc}</p>
                  <Link href={module.href}>
                    <Button variant="outline" className="w-full">Open Module</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

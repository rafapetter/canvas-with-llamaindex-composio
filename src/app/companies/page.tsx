"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, Briefcase, ArrowRight } from "lucide-react";
import { useCopilotAction } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";

interface Company {
  id: string;
  name: string;
  industry: string;
  employees: string;
  jobOpenings: number;
  status: "active" | "pending" | "contacted";
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "TechCorp Solutions",
      industry: "Software Development",
      employees: "500-1000",
      jobOpenings: 12,
      status: "active",
    },
    {
      id: "2",
      name: "Global Manufacturing Inc",
      industry: "Manufacturing",
      employees: "1000-5000",
      jobOpenings: 8,
      status: "pending",
    },
    {
      id: "3",
      name: "Healthcare Innovations",
      industry: "Healthcare",
      employees: "100-500",
      jobOpenings: 15,
      status: "active",
    },
    {
      id: "4",
      name: "Finance Leaders Ltd",
      industry: "Financial Services",
      employees: "5000+",
      jobOpenings: 20,
      status: "contacted",
    },
  ]);

  // CopilotKit action to help sellers find companies
  useCopilotAction({
    name: "find_companies",
    description: "Help sellers find companies that match their expertise",
    parameters: [
      {
        name: "criteria",
        type: "string",
        description: "Search criteria (industry, size, job openings)",
        required: true,
      },
    ],
    handler: async ({ criteria }) => {
      // In a real app, this would search your database
      const matchingCompanies = companies.filter(company => 
        company.industry.toLowerCase().includes(criteria.toLowerCase()) ||
        company.name.toLowerCase().includes(criteria.toLowerCase())
      );
      return `Found ${matchingCompanies.length} companies matching "${criteria}"`;
    },
  });

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "contacted":
        return "bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-3">Companies</h1>
          <p className="text-muted-foreground text-lg">
            Browse companies and start your pitch journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.id}`}
              className="group"
            >
              <div className="relative h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 tracking-tight">
                    {company.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {company.industry}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{company.employees} employees</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    <span>{company.jobOpenings} job openings</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      company.status
                    )}`}
                  >
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                  <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center rounded-2xl border bg-card p-12">
          <div className="max-w-md mx-auto">
            <h2 className="mb-3">Can't find your target company?</h2>
            <p className="text-muted-foreground mb-6">
              Request to add a new company to our platform
            </p>
            <Button size="lg">Request New Company</Button>
          </div>
        </div>
      </div>

      <CopilotPopup
        instructions="Help sellers find the right companies to pitch to based on their expertise and the company's needs. Provide insights about industries, company sizes, and potential opportunities."
        labels={{
          title: "Company Finder Assistant",
          initial: "I can help you find the perfect companies to pitch to. What's your area of expertise?",
        }}
      />
    </div>
  );
}

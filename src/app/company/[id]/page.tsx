"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCoAgent, useCopilotAction, useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotChat } from "@copilotkit/react-ui";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Users, Briefcase, Globe, Target, ArrowLeft, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface CompanyDetails {
  id: string;
  name: string;
  industry: string;
  employees: string;
  website: string;
  description: string;
  jobOpenings: number;
  needs: string[];
  challenges: string[];
  currentSolutions: string[];
  decisionMakers: {
    name: string;
    role: string;
    focus: string;
  }[];
}

// Mock company data - in real app, fetch from API
const getCompanyDetails = (id: string): CompanyDetails => {
  const companies: Record<string, CompanyDetails> = {
    "1": {
      id: "1",
      name: "TechCorp Solutions",
      industry: "Software Development",
      employees: "500-1000",
      website: "www.techcorp.com",
      description: "A leading software development company specializing in enterprise solutions, cloud computing, and AI-driven applications.",
      jobOpenings: 12,
      needs: [
        "Cloud infrastructure optimization",
        "DevOps tooling and automation",
        "Cybersecurity solutions",
        "Employee training platforms",
      ],
      challenges: [
        "Scaling development teams efficiently",
        "Maintaining code quality at scale",
        "Reducing time-to-market for new features",
        "Managing multi-cloud environments",
      ],
      currentSolutions: [
        "AWS for cloud hosting",
        "Jenkins for CI/CD",
        "Slack for communication",
        "Jira for project management",
      ],
      decisionMakers: [
        { name: "Sarah Johnson", role: "CTO", focus: "Technology strategy and innovation" },
        { name: "Mike Chen", role: "VP Engineering", focus: "Development processes and team efficiency" },
        { name: "Lisa Brown", role: "Director of IT", focus: "Infrastructure and security" },
      ],
    },
    "2": {
      id: "2",
      name: "Global Manufacturing Inc",
      industry: "Manufacturing",
      employees: "1000-5000",
      website: "www.globalmanufacturing.com",
      description: "A global leader in advanced manufacturing solutions, specializing in automation, robotics, and supply chain optimization.",
      jobOpenings: 8,
      needs: [
        "Supply chain visibility tools",
        "Predictive maintenance solutions",
        "Quality control automation",
        "Workforce management systems",
      ],
      challenges: [
        "Optimizing production efficiency",
        "Reducing equipment downtime",
        "Managing complex global supply chains",
        "Implementing Industry 4.0 technologies",
      ],
      currentSolutions: [
        "SAP for ERP",
        "Siemens for automation",
        "Microsoft Teams for communication",
        "Tableau for analytics",
      ],
      decisionMakers: [
        { name: "Robert Williams", role: "COO", focus: "Operations and efficiency" },
        { name: "Emily Zhang", role: "VP Supply Chain", focus: "Supply chain optimization" },
        { name: "David Martinez", role: "Director of Manufacturing", focus: "Production and quality" },
      ],
    },
    "3": {
      id: "3",
      name: "Healthcare Innovations",
      industry: "Healthcare",
      employees: "100-500",
      website: "www.healthcareinnovations.com",
      description: "A healthcare technology company focused on improving patient outcomes through innovative digital health solutions and data analytics.",
      jobOpenings: 15,
      needs: [
        "Patient data management systems",
        "Telemedicine platforms",
        "Healthcare analytics tools",
        "Compliance management solutions",
      ],
      challenges: [
        "Ensuring HIPAA compliance",
        "Integrating with legacy systems",
        "Improving patient engagement",
        "Managing healthcare data security",
      ],
      currentSolutions: [
        "Epic for EHR",
        "Zoom for telemedicine",
        "Office 365 for productivity",
        "Veracode for security",
      ],
      decisionMakers: [
        { name: "Dr. Patricia Thompson", role: "Chief Medical Officer", focus: "Clinical excellence and patient care" },
        { name: "James Wilson", role: "CTO", focus: "Healthcare technology and innovation" },
        { name: "Maria Garcia", role: "VP Compliance", focus: "Regulatory compliance and data security" },
      ],
    },
    "4": {
      id: "4",
      name: "Finance Leaders Ltd",
      industry: "Financial Services",
      employees: "5000+",
      website: "www.financeleaders.com",
      description: "A leading financial services company providing investment banking, wealth management, and corporate finance solutions globally.",
      jobOpenings: 20,
      needs: [
        "Risk management platforms",
        "Regulatory compliance tools",
        "Trading analytics systems",
        "Customer relationship management",
      ],
      challenges: [
        "Adapting to changing regulations",
        "Enhancing cybersecurity measures",
        "Improving customer experience",
        "Managing operational costs",
      ],
      currentSolutions: [
        "Bloomberg Terminal for trading",
        "Salesforce for CRM",
        "Workday for HR",
        "Splunk for security monitoring",
      ],
      decisionMakers: [
        { name: "Michael Anderson", role: "CFO", focus: "Financial strategy and risk management" },
        { name: "Jennifer Lee", role: "Chief Risk Officer", focus: "Risk assessment and compliance" },
        { name: "Thomas Brown", role: "CIO", focus: "Technology infrastructure and security" },
      ],
    },
  };

  // Return the company details if found, otherwise return TechCorp as default
  return companies[id] || companies["1"];
};

export default function CompanyDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const company = getCompanyDetails(id);
  const router = useRouter();

  // Add company context to the AI
  useCopilotAdditionalInstructions(
    `You are helping a seller pitch to ${company.name}, a ${company.industry} company with ${company.employees} employees. 
    The company's main needs are: ${company.needs.join(", ")}.
    Their current challenges include: ${company.challenges.join(", ")}.
    Key decision makers are: ${company.decisionMakers.map(dm => `${dm.name} (${dm.role})`).join(", ")}.
    
    Help the seller craft effective pitches, handle objections, and close deals. Be consultative and focus on solving the company's specific problems.`
  );

  // Define actions for the pitch process
  useCopilotAction({
    name: "analyze_company_need",
    description: "Analyze a specific company need and suggest how to address it",
    parameters: [
      {
        name: "need",
        type: "string",
        description: "The specific need to analyze",
        required: true,
      },
    ],
    handler: async ({ need }) => {
      return `Analyzing ${need} for ${company.name}...`;
    },
  });

  useCopilotAction({
    name: "generate_pitch_opener",
    description: "Generate an effective pitch opener for this company",
    parameters: [
      {
        name: "decision_maker",
        type: "string",
        description: "The decision maker you're pitching to",
        required: true,
      },
    ],
    handler: async ({ decision_maker }) => {
      return `Generated opener for ${decision_maker} at ${company.name}`;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/companies">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Companies
              </Button>
            </Link>
            <div className="flex gap-3">
              <Link href={`/pitch-score?company=${id}`}>
                <Button size="sm" variant="outline">View Pitch Scores</Button>
              </Link>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => router.push(`/pitch/${id}`)}
              >
                <Play className="h-4 w-4" />
                Start Pitch
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Chat Section - Left Side */}
        <div className="w-1/2 border-r bg-muted/30">
          <CopilotChat
            className="h-full"
            instructions={`You are a sales coaching AI helping sellers pitch to ${company.name}. Guide them through the pitch process, help them handle objections, and close deals.`}
            labels={{
              title: `Pitch Assistant - ${company.name}`,
              initial: `Welcome! I'm here to help you pitch to ${company.name}. What product or service are you selling, and which decision maker are you targeting?`,
            }}
          />
        </div>

        {/* Company Details - Right Side */}
        <div className="w-1/2 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 space-y-6">
            {/* Company Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="mb-2 truncate">{company.name}</h1>
                  <p className="text-muted-foreground text-base mb-3">{company.industry}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {company.employees}
                    </span>
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {company.website}
                    </span>
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {company.jobOpenings} openings
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="mb-3">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
            </div>

            {/* Company Needs */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                  <Target className="h-4 w-4" />
                </div>
                <h3 className="text-lg">Current Needs</h3>
              </div>
              <ul className="space-y-3">
                {company.needs.map((need, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span className="text-foreground">{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4">Pain Points & Challenges</h3>
              <ul className="space-y-3">
                {company.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    <span className="text-foreground">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Solutions */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4">Current Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {company.currentSolutions.map((solution, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                  >
                    {solution}
                  </span>
                ))}
              </div>
            </div>

            {/* Decision Makers */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="mb-5">Key Decision Makers</h3>
              <div className="space-y-4">
                {company.decisionMakers.map((person, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {person.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-0.5">{person.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{person.role}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium">Focus:</span> {person.focus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Trophy, 
  Clock,
  TrendingUp,
  AlertCircle 
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string; // This is the conversation ID
  }>;
}

interface PitchStatus {
  criteria_status: {
    problem_solution: boolean;
    evidence_proof: boolean;
    differentiation: boolean;
    target_fit: boolean;
    implementation: boolean;
    credibility: boolean;
    business_case: boolean;
    next_steps: boolean;
  };
  score_percentage: number;
  is_passing: boolean;
  last_evaluation: string;
  message_count: number;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

interface CompanyInfo {
  name: string;
  primaryEmail: string;
  decisionMaker: string;
}

// Mock company data - in real app, fetch from API
const getCompanyInfo = (id: string): CompanyInfo => {
  const companies: Record<string, CompanyInfo> = {
    "1": {
      name: "TechCorp Solutions",
      primaryEmail: "sarah.johnson@techcorp.com",
      decisionMaker: "Sarah Johnson",
    },
    "2": {
      name: "Global Manufacturing Inc",
      primaryEmail: "robert.williams@globalmanufacturing.com",
      decisionMaker: "Robert Williams",
    },
    "3": {
      name: "Healthcare Innovations",
      primaryEmail: "patricia.thompson@healthcareinnovations.com",
      decisionMaker: "Dr. Patricia Thompson",
    },
    "4": {
      name: "Finance Leaders Ltd",
      primaryEmail: "michael.anderson@financeleaders.com",
      decisionMaker: "Michael Anderson",
    },
  };

  return companies[id] || companies["1"];
};

export default function PitchResultsPage({ params }: PageProps) {
  const { id: conversationId } = use(params);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") || "";
  const router = useRouter();
  const companyInfo = getCompanyInfo(companyId);
  
  const [pitchStatus, setPitchStatus] = useState<PitchStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: `Following up on our conversation - ${companyInfo.name}`,
    body: `Dear ${companyInfo.decisionMaker},

Thank you for taking the time to discuss how our solution can help ${companyInfo.name} achieve your business objectives.

As we discussed, our platform addresses your key challenges and can deliver significant value to your organization.

I'd love to schedule a follow-up meeting to dive deeper into the implementation timeline and discuss next steps.

Would you be available for a 30-minute call next week?

Best regards,
[Your Name]`
  });

  useEffect(() => {
    fetchPitchStatus();
  }, [conversationId]);

  const fetchPitchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pitch/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      if (response.ok) {
        const result = await response.json();
        setPitchStatus(result.status);
      }
    } catch (error) {
      console.error("Failed to fetch pitch status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFollowUpEmail = async () => {
    setIsSendingEmail(true);
    
    try {
      const response = await fetch("/api/pitch/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: companyInfo.primaryEmail,
          subject: emailTemplate.subject,
          body: emailTemplate.body,
          company_name: companyInfo.name,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setShowEmailForm(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to send email: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const criteriaLabels: Record<string, string> = {
    problem_solution: "Problem & Solution",
    evidence_proof: "Evidence & Proof",
    differentiation: "Differentiation",
    target_fit: "Target Fit",
    implementation: "Implementation",
    credibility: "Credibility",
    business_case: "Business Case",
    next_steps: "Next Steps",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mx-auto mb-5"></div>
          <p className="text-muted-foreground font-medium">Loading pitch results...</p>
        </div>
      </div>
    );
  }

  const isPassing = pitchStatus?.is_passing || false;
  const score = pitchStatus?.score_percentage || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/company/${companyId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Company
              </Button>
            </Link>
            <Link href="/pitch-score">
              <Button size="sm" variant="outline">View All Pitches</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Result Header */}
        <div className={`rounded-3xl p-12 mb-10 text-center shadow-sm border ${
          isPassing
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
            : "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
        }`}>
          <div className="flex justify-center mb-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${
              isPassing ? "bg-green-500/10" : "bg-orange-500/10"
            }`}>
              {isPassing ? (
                <Trophy className="h-10 w-10 text-green-600" />
              ) : (
                <AlertCircle className="h-10 w-10 text-orange-600" />
              )}
            </div>
          </div>
          <h1 className="mb-3">
            {isPassing ? "Pitch Successful!" : "Pitch Needs Improvement"}
          </h1>
          <div className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl mb-4 font-bold text-3xl ${
            isPassing ? "bg-green-600 text-white" : "bg-orange-600 text-white"
          }`}>
            {score.toFixed(0)}%
          </div>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            {isPassing
              ? "Congratulations! You've met the criteria for a successful pitch."
              : "You didn't quite meet the 60% threshold. Review the feedback below to improve."}
          </p>
        </div>

        {/* Criteria Breakdown */}
        <div className="bg-card rounded-2xl border p-8 mb-8 shadow-sm">
          <h2 className="mb-6">Criteria Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(criteriaLabels).map(([key, label]) => {
              const isMet = pitchStatus?.criteria_status[key as keyof typeof pitchStatus.criteria_status] || false;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3.5 p-4 rounded-xl transition-all ${
                    isMet
                      ? "bg-green-50 border border-green-200"
                      : "bg-muted/50"
                  }`}
                >
                  {isMet ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    isMet ? "text-green-900" : "text-muted-foreground"
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-card rounded-2xl border p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{pitchStatus?.message_count || 0}</p>
            <p className="text-sm text-muted-foreground font-medium">Messages Sent</p>
          </div>
          <div className="bg-card rounded-2xl border p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{score.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground font-medium">Score Achieved</p>
          </div>
          <div className="bg-card rounded-2xl border p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {Object.values(pitchStatus?.criteria_status || {}).filter(Boolean).length}/8
            </p>
            <p className="text-sm text-muted-foreground font-medium">Criteria Met</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-5">
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center w-full max-w-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-green-900 mb-1">Email draft created successfully!</p>
              <p className="text-sm text-green-700/80">
                Check your Gmail drafts to review and send the email.
              </p>
            </div>
          )}
          <div className="flex gap-4">
            {isPassing && !emailSent && (
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setShowEmailForm(true)}
              >
                <Mail className="h-5 w-5" />
                Send Follow-up Email
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(`/pitch/${companyId}`)}
            >
              Try Another Pitch
            </Button>
          </div>
        </div>

        {/* Email Form Modal */}
        {showEmailForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-background border rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">Send Follow-up Email</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmailForm(false)}
                    disabled={isSendingEmail}
                    className="rounded-xl"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">To</label>
                    <input
                      type="email"
                      value={companyInfo.primaryEmail}
                      disabled
                      className="w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company</label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      disabled
                      className="w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={emailTemplate.subject}
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <textarea
                    value={emailTemplate.body}
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                    rows={15}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Enter your follow-up message..."
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-primary">💡 Tip:</span> This email will be sent as a draft to your Gmail account.
                    You can review and send it from there, or it will be sent automatically if configured.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-background border-t px-8 py-6 rounded-b-3xl">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailTemplate({
                        subject: `Following up on our conversation - ${companyInfo.name}`,
                        body: `Dear ${companyInfo.decisionMaker},\n\nThank you for taking the time to discuss how our solution can help ${companyInfo.name} achieve your business objectives.\n\nAs we discussed, our platform addresses your key challenges and can deliver significant value to your organization.\n\nI'd love to schedule a follow-up meeting to dive deeper into the implementation timeline and discuss next steps.\n\nWould you be available for a 30-minute call next week?\n\nBest regards,\n[Your Name]`
                      });
                    }}
                    disabled={isSendingEmail}
                  >
                    Reset Template
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailForm(false)}
                      disabled={isSendingEmail}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={sendFollowUpEmail}
                      disabled={isSendingEmail || !emailTemplate.subject.trim() || !emailTemplate.body.trim()}
                      className="gap-2"
                      size="lg"
                    >
                      {isSendingEmail ? (
                        <>Creating Draft...</>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Create Email Draft
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

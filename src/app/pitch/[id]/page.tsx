"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowLeft, Timer, CheckCircle2, Circle, Send } from "lucide-react";

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
  painPoints: string[];
  decisionMakers: string[];
  budgetRange: string;
  currentSolutions: string[];
}

interface PitchCriteria {
  problem_solution: boolean;
  evidence_proof: boolean;
  differentiation: boolean;
  target_fit: boolean;
  implementation: boolean;
  credibility: boolean;
  business_case: boolean;
  next_steps: boolean;
}

interface PitchStatus {
  criteria_status: PitchCriteria;
  score_percentage: number;
  is_passing: boolean;
  last_evaluation: string;
  message_count: number;
}

// Mock company data - in real app, fetch from API
const getCompanyDetails = (id: string): CompanyDetails => {
  const companies: Record<string, CompanyDetails> = {
    "1": {
      id: "1",
      name: "TechCorp Solutions",
      industry: "Software Development",
      employees: "500-1000",
      painPoints: [
        "Scaling development teams efficiently",
        "Maintaining code quality at scale",
        "Reducing time-to-market",
      ],
      decisionMakers: ["Sarah Johnson (CTO)", "Mike Chen (VP Engineering)"],
      budgetRange: "$100K - $500K",
      currentSolutions: ["AWS", "Jenkins", "Slack", "Jira"],
    },
    "2": {
      id: "2",
      name: "Global Manufacturing Inc",
      industry: "Manufacturing",
      employees: "1000-5000",
      painPoints: [
        "Optimizing production efficiency",
        "Reducing equipment downtime",
        "Managing complex global supply chains",
      ],
      decisionMakers: ["Robert Williams (COO)", "Emily Zhang (VP Supply Chain)"],
      budgetRange: "$500K - $2M",
      currentSolutions: ["SAP", "Siemens", "Microsoft Teams", "Tableau"],
    },
    "3": {
      id: "3",
      name: "Healthcare Innovations",
      industry: "Healthcare",
      employees: "100-500",
      painPoints: [
        "Ensuring HIPAA compliance",
        "Integrating with legacy systems",
        "Improving patient engagement",
      ],
      decisionMakers: ["Dr. Patricia Thompson (CMO)", "James Wilson (CTO)"],
      budgetRange: "$200K - $1M",
      currentSolutions: ["Epic", "Zoom", "Office 365", "Veracode"],
    },
    "4": {
      id: "4",
      name: "Finance Leaders Ltd",
      industry: "Financial Services",
      employees: "5000+",
      painPoints: [
        "Adapting to changing regulations",
        "Enhancing cybersecurity measures",
        "Improving customer experience",
      ],
      decisionMakers: ["Michael Anderson (CFO)", "Jennifer Lee (CRO)"],
      budgetRange: "$1M - $5M",
      currentSolutions: ["Bloomberg Terminal", "Salesforce", "Workday", "Splunk"],
    },
  };

  // Return the company details if found, otherwise return TechCorp as default
  return companies[id] || companies["1"];
};

export default function PitchPage({ params }: PageProps) {
  const { id } = use(params);
  const company = getCompanyDetails(id);
  const router = useRouter();
  const [conversationId] = useState(() => `pitch-${id}-${Date.now()}`);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pitchStatus, setPitchStatus] = useState<PitchStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [isPitchEnded, setIsPitchEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the pitch conversation
  useEffect(() => {
    initializePitch();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start timer
  useEffect(() => {
    if (!isPitchEnded && pitchStatus) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endPitch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPitchEnded, pitchStatus]);

  // Check if criteria met
  useEffect(() => {
    if (pitchStatus?.is_passing && !isPitchEnded) {
      endPitch();
    }
  }, [pitchStatus?.is_passing]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializePitch = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        setIsLoading(true);
        const response = await fetch("/api/pitch/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            company_info: {
              name: company.name,
              industry: company.industry,
              size: company.employees,
              pain_points: company.painPoints,
              decision_makers: company.decisionMakers,
              budget_range: company.budgetRange,
              current_solutions: company.currentSolutions,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setMessages([
            {
              role: "assistant",
              content: `Welcome! You have 2 minutes to pitch to ${company.name}. I'll evaluate your pitch based on 8 key criteria. Start your pitch now!`,
            },
          ]);
          // Get initial status
          await updatePitchStatus();
          return; // Success, exit retry loop
        } else {
          const errorData = await response.json();
          throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`Pitch initialization attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          continue;
        } else {
          // All retries failed
          setMessages([
            {
              role: "assistant",
              content: `❌ Failed to initialize pitch after ${maxRetries} attempts. Please refresh the page and try again. Error: ${error.message}`,
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updatePitchStatus = async () => {
    try {
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
      console.error("Failed to get pitch status:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isPitchEnded) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/pitch/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: result.response }]);
        setPitchStatus(result.status);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const endPitch = () => {
    setIsPitchEnded(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Navigate to results page
    setTimeout(() => {
      router.push(`/pitch-results/${conversationId}?company=${id}`);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const criteriaLabels: Record<keyof PitchCriteria, string> = {
    problem_solution: "Problem & Solution",
    evidence_proof: "Evidence & Proof",
    differentiation: "Differentiation",
    target_fit: "Target Fit",
    implementation: "Implementation",
    credibility: "Credibility",
    business_case: "Business Case",
    next_steps: "Next Steps",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/company/${id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Company
              </Button>
            </Link>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-muted/50">
                <Timer className={`h-4 w-4 ${timeRemaining < 30 ? "text-destructive" : "text-muted-foreground"}`} />
                <span className={`font-mono font-semibold text-base ${timeRemaining < 30 ? "text-destructive" : "text-foreground"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                Score: {pitchStatus?.score_percentage.toFixed(0) || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Chat Section - Left Side */}
        <div className="w-2/3 border-r flex flex-col bg-muted/20">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <p className="text-sm text-muted-foreground ml-1">Evaluating your pitch...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t bg-background p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="max-w-3xl mx-auto flex gap-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isPitchEnded ? "Pitch ended" : "Type your pitch here..."}
                disabled={isPitchEnded || isLoading}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              <Button
                type="submit"
                disabled={isPitchEnded || isLoading || !inputMessage.trim()}
                size="lg"
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Criteria Tracking - Right Side */}
        <div className="w-1/3 p-8 overflow-y-auto bg-background">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 tracking-tight">Pitch Progress</h2>
              <div className="relative mb-4">
                <Progress value={pitchStatus?.score_percentage || 0} className="h-4" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  {pitchStatus?.score_percentage.toFixed(0) || 0}% Complete
                </span>
                <span className={`font-semibold px-3 py-1 rounded-lg ${
                  (pitchStatus?.score_percentage || 0) >= 60
                    ? 'bg-green-500/10 text-green-700'
                    : 'bg-orange-500/10 text-orange-700'
                }`}>
                  {pitchStatus?.is_passing ? 'PASSING' : '60% Required'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-5 text-base tracking-tight">Evaluation Criteria</h3>
              <div className="space-y-3">
                {Object.entries(criteriaLabels).map(([key, label]) => {
                  const isComplete = pitchStatus?.criteria_status[key as keyof PitchCriteria];
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isComplete ? 'bg-green-50 border border-green-200' : 'bg-muted/30'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          isComplete
                            ? "font-medium text-green-900"
                            : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isPitchEnded && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Pitch Complete!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pitchStatus?.is_passing
                    ? "Congratulations! You've met the criteria."
                    : "Time's up! Redirecting to results..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

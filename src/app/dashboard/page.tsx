"use client";

import { useVoter } from "@/context/VoterContext";
import { useAuth } from "@/context/AuthContext";
import { Card, Badge, Button, cn } from "@/components/ui";
import { 
  Calendar, CheckCircle2, AlertTriangle, Clock, MapPin, 
  Search, MessageSquare, ChevronRight, Menu, Bell
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const { plan } = useVoter();
  const { profile, logOut } = useAuth();

  if (!plan) return <div className="p-10 text-center">Loading your personalized plan...</div>;

  const nextAction = plan.nextAction;
  const daysLeft = nextAction ? differenceInDays(nextAction.deadline, new Date()) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-xl tracking-tight">CivicFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <button onClick={logOut} className="text-xs text-slate-500 hover:text-red-500">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hello, {profile?.displayName?.split(' ')[0] || 'Voter'}!</h1>
            <p className="text-slate-500">Here is your personalized election guide for {profile?.location.state}.</p>
          </div>
          <Badge variant={plan.riskLevel === 'high' ? 'danger' : plan.riskLevel === 'medium' ? 'warning' : 'success'}>
            Status: {plan.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Risk & Next Action */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Risk Meter Card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none overflow-hidden relative">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-2xl font-bold">Deadline Risk Meter</h2>
                  <p className="text-slate-400 max-w-sm">
                    You have <span className="text-white font-bold">{daysLeft} days</span> until your next major deadline: <span className="text-blue-400 font-bold">{nextAction?.title}</span>.
                  </p>
                  <Link href="/checker">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Recovery Plan</Button>
                  </Link>
                </div>
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="80" className="stroke-slate-700 fill-none" strokeWidth="12" />
                    <circle 
                      cx="96" cy="96" r="80" 
                      className={cn("fill-none transition-all duration-1000", plan.riskLevel === 'high' ? 'stroke-red-500' : plan.riskLevel === 'medium' ? 'stroke-amber-500' : 'stroke-green-500')}
                      strokeWidth="12" 
                      strokeDasharray="502.6" 
                      strokeDashoffset={502.6 * (1 - (daysLeft / 30))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{daysLeft}</span>
                    <span className="text-xs text-slate-400 uppercase">Days Left</span>
                  </div>
                </div>
              </div>
              {/* Background accent */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            </Card>

            {/* Next Action Card */}
            {nextAction && (
              <Card className="border-l-4 border-l-blue-600">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                    <Clock size={24} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-lg">{nextAction.title}</h3>
                      <Badge variant="warning">High Priority</Badge>
                    </div>
                    <p className="text-slate-500 text-sm">{nextAction.description}</p>
                    <div className="pt-4 flex items-center gap-4">
                      <Button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white">Complete Now</Button>
                      <Link href="/resources" className="text-sm font-bold text-blue-600 hover:underline">Learn More</Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Personalized Timeline
              </h2>
              <div className="space-y-4">
                {plan.tasks.map((task, idx) => (
                  <div key={task.id} className="relative pl-8 pb-4 group">
                    {idx !== plan.tasks.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                    )}
                    <div className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-colors",
                      task.status === 'completed' ? 'bg-green-500 border-green-100 dark:border-green-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    )}>
                      {task.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{task.title}</span>
                        <span className="text-xs font-medium text-slate-400">{format(task.deadline, 'MMM dd, yyyy')}</span>
                      </div>
                      <p className="text-sm text-slate-500">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tools & Quick Links */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Search size={18} className="text-blue-600" />
                Quick Tools
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { title: 'Polling Place Finder', icon: MapPin, href: '/map' },
                  { title: 'Eligibility Checker', icon: CheckCircle2, href: '/checker' },
                  { title: 'Compare Voting Methods', icon: MessageSquare, href: '/comparator' },
                ].map(tool => (
                  <Link key={tool.title} href={tool.href}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <tool.icon size={18} />
                        </div>
                        <span className="text-sm font-medium">{tool.title}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="bg-blue-600 text-white border-none">
              <h3 className="font-bold mb-2">Need help?</h3>
              <p className="text-blue-100 text-xs mb-4">Chat with our Election Copilot for plain-language answers to your questions.</p>
              <Link href="/chat">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Start Chat</Button>
              </Link>
            </Card>

            <Card className="space-y-4">
              <h3 className="font-bold">Official Sources</h3>
              <div className="space-y-2">
                <a href="#" className="text-sm text-blue-600 hover:underline block">State Board of Elections</a>
                <a href="#" className="text-sm text-blue-600 hover:underline block">Federal Voting Assistance</a>
                <a href="#" className="text-sm text-blue-600 hover:underline block">National Voter Hotline</a>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

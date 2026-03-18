import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { tasks, projects, hurdles, towers, departmentStats } from "@/data/demo-data";

const suggestions = [
  "Which project is most delayed?",
  "Show overdue tasks",
  "Show hurdles affecting Tower A",
  "Predict next delay risk",
  "Give me a progress summary",
];

function generateResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('delayed') || q.includes('overdue')) {
    const delayedTasks = tasks.filter(t => t.status === 'delayed' || t.delayDays > 0);
    const lines = delayedTasks.map(t => `• **${t.title}** — ${t.delayDays} days delayed (${t.delayReason || 'No reason specified'})`);
    return `📊 **Delayed Tasks Analysis**\n\nFound ${delayedTasks.length} tasks with delays:\n\n${lines.join('\n')}\n\n**Total impact:** ${delayedTasks.reduce((a, t) => a + t.delayDays, 0)} days across all tasks.\n\nThe most impacted project is **Marine Heights** with ${delayedTasks.filter(t => t.projectId === 'p1').length} delayed tasks.`;
  }

  if (q.includes('hurdle') && q.includes('tower a')) {
    const towerAHurdles = hurdles.filter(h => h.affectedTower === 'Tower A');
    const lines = towerAHurdles.map(h => `• **${h.title}** — ${h.severity} severity, ${h.impactDays} days impact, Status: ${h.status}`);
    return `🚧 **Hurdles Affecting Tower A**\n\nFound ${towerAHurdles.length} hurdles:\n\n${lines.join('\n')}\n\n**Critical issues:** ${towerAHurdles.filter(h => h.severity === 'critical').length} critical, ${towerAHurdles.filter(h => h.status !== 'resolved').length} unresolved.`;
  }

  if (q.includes('progress') || q.includes('summary')) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProg = tasks.filter(t => t.status === 'in_progress').length;
    const projLines = projects.map(p => `• **${p.name}** — ${p.progress}% complete (${p.status})`);
    return `📈 **Portfolio Progress Summary**\n\n${projLines.join('\n')}\n\n**Task Breakdown:**\n• Completed: ${completed}/${tasks.length}\n• In Progress: ${inProg}\n• Blocked: ${tasks.filter(t => t.status === 'blocked').length}\n• Delayed: ${tasks.filter(t => t.status === 'delayed').length}\n\n**Active Towers:** ${towers.filter(t => t.status === 'Construction').length} under construction.`;
  }

  if (q.includes('predict') || q.includes('risk')) {
    const criticalTasks = tasks.filter(t => t.criticalPath && t.status !== 'completed');
    const highRisk = criticalTasks.filter(t => t.delayDays > 0 || t.status === 'blocked');
    return `🔮 **Delay Risk Prediction**\n\n**High-risk tasks (${highRisk.length}):**\n${highRisk.map(t => `• **${t.title}** — ${t.delayDays > 0 ? t.delayDays + ' days behind' : 'Blocked'}, ${t.department}`).join('\n')}\n\n**Risk factors detected:**\n• ${hurdles.filter(h => h.status !== 'resolved').length} unresolved hurdles\n• ${tasks.filter(t => t.status === 'blocked').length} blocked tasks\n• Critical path tasks at risk: ${highRisk.length}\n\n**Recommendation:** Focus on resolving the Formwork Material Delay and Electrical Panel Delivery hurdles to reduce cascading delays.`;
  }

  if (q.includes('department') || q.includes('performance')) {
    const lines = departmentStats.map(d => `• **${d.name}** — ${d.completed} completed, ${d.delayed} delayed (${Math.round((d.completed / d.total) * 100)}% rate)`);
    return `🏢 **Department Performance**\n\n${lines.join('\n')}\n\nTop performer: **Civil** with highest completion rate.\nNeeds attention: **Finishing** with proportionally higher delays.`;
  }

  // Default
  const completionRate = Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100);
  return `I can help you with project insights! Here's a quick snapshot:\n\n• **${projects.length} projects** in portfolio\n• **${completionRate}%** overall completion\n• **${hurdles.filter(h => h.status !== 'resolved').length}** active hurdles\n• **${tasks.filter(t => t.status === 'delayed').length}** delayed tasks\n\nTry asking:\n• "Which project is most delayed?"\n• "Show hurdles affecting Tower A"\n• "Predict next delay risk"`;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Hello! I\'m your **Real Estate Execution OS** assistant. I can analyze your project data and provide insights on delays, hurdles, performance, and risk predictions.\n\nWhat would you like to know?' },
  ]);
  const [input, setInput] = useState("");

  const send = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const response = generateResponse(msg);
    setMessages(prev => [...prev, { role: 'user', text: msg }, { role: 'assistant', text: response }]);
    setInput("");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Powered by your project data</p>
      </div>

      <Card className="min-h-[500px] flex flex-col">
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.text.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <div className="border-t p-4">
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your projects..." onKeyDown={(e) => e.key === 'Enter' && send()} />
            <Button size="icon" onClick={() => send()}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;

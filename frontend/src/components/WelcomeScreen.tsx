import { Heart, Shield, Stethoscope, MapPin } from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Symptom Analysis",
    description: "Describe your symptoms and get AI-powered guidance",
  },
  {
    icon: Shield,
    title: "Triage Assessment",
    description: "Understand the urgency of your condition",
  },
  {
    icon: MapPin,
    title: "Nearby Care",
    description: "Find hospitals and specialists close to you",
  },
];

const suggestions = [
  "I've had a headache for 3 days",
  "I have chest tightness and shortness of breath",
  "My throat is sore and I have a fever",
  "I twisted my ankle, it's swollen",
];

interface Props {
  onSuggestion: (text: string) => void;
}

export function WelcomeScreen({ onSuggestion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center animate-fade-in">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
        <Heart size={32} className="text-emerald-600" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Sanjeevni</h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Your personal health assistant. Describe your symptoms and I'll help you understand
        what might be going on and whether you need professional care.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground"
          >
            <f.icon size={12} className="text-emerald-600" />
            <span>{f.title}</span>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
        Try asking about
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-sm text-left bg-card hover:bg-accent border border-border rounded-xl px-4 py-3 transition-colors text-card-foreground hover:text-accent-foreground"
          >
            "{s}"
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground mt-8 max-w-xs leading-relaxed">
        This service provides general health information only and is not a substitute for professional
        medical advice, diagnosis, or treatment. Always seek the advice of your physician or other
        qualified health provider.
      </p>
    </div>
  );
}

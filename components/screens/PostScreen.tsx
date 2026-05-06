"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { formatStepNarration, formatListingForVoice, playTTS } from "@/lib/voice";
import { usePostStore } from "@/lib/postStore";
import VoicePostInput from "@/components/voice/VoicePostInput";
import VoiceAgentPost from "@/components/voice/VoiceAgentPost";

const STEPS = [
  {
    id: 1,
    label: "Category",
    description: "Choose a section for your listing",
    narration: "Step 1 of 4. Choose a category for your listing. Select the section that best fits what you are selling or offering.",
  },
  {
    id: 2,
    label: "Details",
    description: "Title, price, and description",
    narration: "Step 2 of 4. Add your listing details. Include a title, set your price, and write a brief description.",
  },
  {
    id: 3,
    label: "Location",
    description: "Neighborhood and contact info",
    narration: "Step 3 of 4. Add your location and contact information. Select the neighborhood and provide your email or phone.",
  },
  {
    id: 4,
    label: "Review",
    description: "Confirm and publish",
    narration: "Step 4 of 4. Review your listing and publish it. You can hear it read aloud before going live.",
  },
];

const CATEGORIES = [
  { id: "transit", label: "For Wheels", icon: "bike" },
  { id: "shelter", label: "For Rent", icon: "home" },
  { id: "gear", label: "For Sale", icon: "cube" },
  { id: "labor", label: "For Hire", icon: "wrench" },
  { id: "free", label: "Free Picks", icon: "gift" },
  { id: "audio", label: "Sound Kit", icon: "wave" },
  { id: "people", label: "Connect", icon: "users" },
  { id: "misc", label: "Oddities", icon: "star" },
];

const CAT_LABELS: Record<string, string> = {
  transit: "FOR WHEELS",
  shelter: "FOR RENT",
  gear: "FOR SALE",
  labor: "FOR HIRE",
  free: "FREE PICKS",
  audio: "SOUND KIT",
  people: "CONNECT",
  misc: "ODDITIES",
};

function StepGuide({ step }: { step: number }) {
  const [speaking, setSpeaking] = useState(false);
  const info = STEPS[step - 1];

  const listen = () => {
    if (speaking) return;
    setSpeaking(true);
    playTTS(info.narration).finally(() => setSpeaking(false));
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-black text-2xl text-ink">{info.description}</h2>
      <button
        onClick={listen}
        className={`flex items-center gap-1.5 px-3 py-1.5 border font-data text-[10px] tracking-[0.15em] uppercase transition-colors ${
          speaking
            ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
            : "border-rule text-dust hover:border-terracotta hover:text-terracotta"
        }`}
        title="Listen to step instructions"
      >
        {speaking ? (
          <>
            <span className="flex gap-px">
              {[1,2,3].map(i => (
                <span key={i} className="w-0.5 bg-terracotta rounded-full animate-wave-bar" style={{ height: 8, animationDelay: `${i * 0.08}s` }} />
              ))}
            </span>
            Playing...
          </>
        ) : (
          <>
            <Icon name="speak" size={12} />
            Listen
          </>
        )}
      </button>
    </div>
  );
}

export default function PostScreen() {
  const router = useRouter();
  const { addPost } = usePostStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cat: "",
    title: "",
    price: "",
    desc: "",
    hood: "",
    email: "",
    phone: "",
  });
  const [power, setPower] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [stepNarration, setStepNarration] = useState(false);

  const [showVoicePost, setShowVoicePost] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      const filled = Object.values(updated).filter(Boolean).length;
      setPower(Math.round((filled / 7) * 100));
      return updated;
    });
  };

  // Announce step change
  useEffect(() => {
    if (step === 1) return;
    const msg = formatStepNarration(step, STEPS.length);
    setStepNarration(true);
    playTTS(msg).finally(() => setStepNarration(false));
  }, [step]);

  const handleVoiceSubmit = async (transcript: string) => {
    setShowVoicePost(false);
    const res = await fetch("/api/post/parse-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) return;
    const fields = await res.json();
    setForm((prev) => ({
      cat: fields.cat || prev.cat,
      title: fields.title || prev.title,
      price: fields.price ? String(fields.price) : prev.price,
      desc: fields.desc || prev.desc,
      hood: fields.hood || prev.hood,
      email: fields.email || prev.email,
      phone: fields.phone || prev.phone,
    }));
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
  };

  const publish = () => {
    const listing = addPost(form);
    console.info("[LISTING] Published:", listing.id, listing.title);
    setShowSuccess(true);
    setTimeout(() => router.push("/"), 3000);
  };

  const readAloud = () => {
    if (speaking || !form.title) return;
    const text = formatListingForVoice({
      title: form.title,
      price: Number(form.price) || 0,
      hood: form.hood,
      desc: form.desc,
      cat: form.cat,
    });
    setSpeaking(true);
    playTTS(text).finally(() => setSpeaking(false));
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-sage/20 flex items-center justify-center">
            <Icon name="check" size={40} className="text-sage" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-starburst">
            <span className="text-gold text-4xl">✦</span>
          </div>
        </div>
        <h2 className="font-display font-black text-5xl text-ink mb-4">Posted!</h2>
        <p className="font-body text-mahogany text-lg">
          Your listing is live. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b border-rule bg-paper px-4 md:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display font-black text-4xl text-ink mb-2">Post a Listing</h1>
          <p className="font-body text-mahogany">List something in the city</p>
        </div>
      </div>

      <div className="flex-1 py-10 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Power meter */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Power meter</span>
              <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">{power}%</span>
            </div>
            <div className="h-2 bg-paper border border-rule">
              <div
                className="h-full bg-terracotta transition-all duration-500"
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-12">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 font-data text-[10px] tracking-[0.2em] uppercase transition-colors ${
                    step === s.id ? "text-terracotta" : step > s.id ? "text-sage" : "text-dust"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                      step === s.id
                        ? "border-terracotta text-terracotta"
                        : step > s.id
                        ? "border-sage bg-sage/20 text-sage"
                        : "border-rule text-dust"
                    }`}
                  >
                    {stepNarration && step === s.id ? (
                      <span className="flex gap-px">
                        {[1,2,3].map(j => (
                          <span
                            key={j}
                            className="w-0.5 h-3 bg-terracotta rounded-full animate-wave-bar"
                            style={{ animationDelay: `${j * 0.1}s` }}
                          />
                        ))}
                      </span>
                    ) : step > s.id ? (
                      <Icon name="check" size={10} />
                    ) : s.id}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${step > s.id ? "bg-sage" : "bg-rule"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Talk it through */}
          <div className="mt-4 flex items-center justify-end gap-4">
            <button
              onClick={() => setShowVoicePost(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-terracotta text-terracotta font-data text-[10px] tracking-[0.2em] uppercase hover:bg-terracotta hover:text-cream transition-colors"
            >
              <Icon name="wave" size={13} />
              Talk it through
            </button>
          </div>

          {/* Step content */}
          <div className="bg-paper border border-rule p-8">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <StepGuide step={1} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => update("cat", cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        form.cat === cat.id
                          ? "border-ink bg-ink text-cream"
                          : "border-rule hover:border-ink"
                      }`}
                    >
                      <Icon name={cat.icon} size={20} />
                      <span className="font-data text-[10px] tracking-[0.15em] uppercase">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <StepGuide step={2} />
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="What are you selling?"
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink placeholder:text-dust/60 outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Price ($0 for free)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink placeholder:text-dust/60 outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.desc}
                    onChange={(e) => update("desc", e.target.value)}
                    placeholder="More details..."
                    rows={5}
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink placeholder:text-dust/60 outline-none focus:border-ink transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <StepGuide step={3} />
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Neighborhood
                  </label>
                  <select
                    value={form.hood}
                    onChange={(e) => update("hood", e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink outline-none focus:border-ink transition-colors"
                  >
                    <option value="">Select neighborhood</option>
                    {[
                      "Mission", "SoMa", "North Beach", "Castro", "Hayes Valley",
                      "Outer Sunset", "Inner Richmond", "Dogpatch", "Noe Valley",
                      "Pacific Heights", "Bayview", "Excelsior", "Glen Park", "Civic Center",
                    ].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink placeholder:text-dust/60 outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-data text-[10px] tracking-[0.2em] uppercase text-dust mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+1 (415) 000-0000"
                    className="w-full px-4 py-3 bg-cream border border-rule font-body text-ink placeholder:text-dust/60 outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <StepGuide step={4} />
                  {/* Read aloud */}
                  <button
                    onClick={readAloud}
                    disabled={!form.title && speaking}
                    className={`flex items-center gap-2 px-4 py-2 border font-data text-[10px] tracking-[0.2em] uppercase transition-all ${
                      speaking
                        ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
                        : "border-rule hover:border-terracotta text-dust hover:text-terracotta"
                    }`}
                  >
                    {speaking ? (
                      <>
                        <span className="flex gap-px">
                          {[1,2,3,4].map(j => (
                            <span key={j} className="w-0.5 bg-terracotta rounded-full animate-wave-bar" style={{ height: 10, animationDelay: `${j * 0.08}s` }} />
                          ))}
                        </span>
                        Playing...
                      </>
                    ) : (
                      <>
                        <Icon name="speak" size={12} />
                        Read aloud
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-cream border border-rule p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Category</span>
                    <span className="font-data text-sm text-ink uppercase">
                      {form.cat ? CAT_LABELS[form.cat] ?? form.cat : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Title</span>
                    <span className="font-display text-sm text-ink">{form.title || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Price</span>
                    <span className="font-display font-black text-2xl text-ink">
                      {form.price === "" ? "—" : Number(form.price) === 0 ? "FREE" : `$${Number(form.price).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Location</span>
                    <span className="font-display text-sm text-ink">{form.hood || "—"}</span>
                  </div>
                  {form.desc && (
                    <div>
                      <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Description</span>
                      <p className="font-body text-sm text-mahogany mt-1">{form.desc}</p>
                    </div>
                  )}
                  {form.email && (
                    <div className="flex items-center justify-between">
                      <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">Email</span>
                      <span className="font-data text-sm text-ink">{form.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-5 py-2.5 font-data text-[11px] tracking-[0.2em] uppercase text-mahogany border border-rule hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            {step < 4 ? (
              <Button variant="primary" onClick={next}>
                Continue
                <Icon name="arrow" size={12} />
              </Button>
            ) : (
              <Button variant="primary" onClick={publish} className="btn-shine">
                Publish Listing
              </Button>
            )}
          </div>
        </div>
      </div>

      {showVoicePost && (
        <VoiceAgentPost
          onSubmit={(data) => {
            setShowVoicePost(false);
            setForm((prev) => ({
              cat: data.cat || prev.cat,
              title: data.title || prev.title,
              price: data.price || prev.price,
              desc: data.desc || prev.desc,
              hood: data.hood || prev.hood,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
            }));
          }}
          onClose={() => setShowVoicePost(false)}
        />
      )}
    </div>
  );
}
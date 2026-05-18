import { useState } from "react";

const CONTENT_TYPES = [
  { id: "tweet", label: "تغريدة", labelEn: "Tweet", icon: "✦" },
  { id: "thread", label: "Thread", labelEn: "Thread", icon: "◈" },
  { id: "hook", label: "Hook تيك توك", labelEn: "TikTok Hook", icon: "◉" },
];

const TONES = [
  { id: "bold", label: "جريء", labelEn: "Bold" },
  { id: "educational", label: "تعليمي", labelEn: "Educational" },
  { id: "story", label: "قصة", labelEn: "Story" },
  { id: "controversial", label: "استفزازي", labelEn: "Provocative" },
];

export default function ContentEngine() {
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState("tweet");
  const [selectedTone, setSelectedTone] = useState("bold");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("ar");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const typeLabel = CONTENT_TYPES.find(t => t.id === selectedType);
    const toneLabel = TONES.find(t => t.id === selectedTone);

    const prompt = `You are an expert bilingual content creator for X (Twitter) and TikTok targeting Arabic and English-speaking audiences.

Generate content for the topic: "${topic}"
Content type: ${typeLabel.labelEn}
Tone: ${toneLabel.labelEn}

Rules:
- Arabic content: native Gulf/Saudi style, punchy, relatable
- English content: direct, American internet style
- Tweets: max 280 chars each
- Threads: 7 tweets numbered 1/ 2/ 3/ 4/ 5/ 6/ 7/
- TikTok Hook: opening 3 seconds script only, pattern-interrupt style

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "arabic": {
    "content": "the arabic content here",
    "tip": "one short tip in arabic for this content"
  },
  "english": {
    "content": "the english content here", 
    "tip": "one short tip in english for this content"
  }
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setActiveTab("ar");
    } catch (err) {
      setResult({ error: "حدث خطأ، حاول مجدداً" });
    }
    setLoading(false);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Syne', sans-serif",
      color: "#f0ede8",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #ff4d00; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #ff4d00; border-radius: 2px; }

        .chip { transition: all 0.2s ease; cursor: pointer; }
        .chip:hover { transform: translateY(-1px); }
        .chip.active { background: #ff4d00 !important; color: #fff !important; border-color: #ff4d00 !important; }

        .gen-btn {
          background: #ff4d00;
          border: none;
          color: #fff;
          padding: 14px 36px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .gen-btn:hover:not(:disabled) { background: #e64400; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,0,0.35); }
        .gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tab { cursor: pointer; transition: all 0.2s; padding: 8px 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; border: 1px solid transparent; }
        .tab.active { border-color: #ff4d00; color: #ff4d00; }
        .tab:not(.active) { color: #666; }
        .tab:not(.active):hover { color: #999; }

        .copy-btn { cursor: pointer; background: transparent; border: 1px solid #333; color: #888; padding: 6px 14px; font-size: 11px; font-family: 'Syne', sans-serif; font-weight: 600; letter-spacing: 0.08em; transition: all 0.2s; }
        .copy-btn:hover { border-color: #ff4d00; color: #ff4d00; }
        .copy-btn.copied { border-color: #00c853; color: #00c853; }

        .result-box { background: #111118; border: 1px solid #1e1e2e; padding: 20px; white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #ddd; }
        .tip-box { background: rgba(255,77,0,0.07); border-left: 3px solid #ff4d00; padding: 10px 14px; font-size: 13px; color: #ff9966; margin-top: 12px; }

        textarea { resize: none; outline: none; }
        textarea:focus { border-color: #ff4d00 !important; }

        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .loading-dot { animation: pulse 1.2s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }

        .noise { position: fixed; inset: 0; opacity: 0.025; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; z-index: 0; }
      `}</style>

      <div className="noise" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a24", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 32, height: 32, background: "#ff4d00", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>ContentEngine</div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>AR × EN GENERATOR</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#ff4d00", fontWeight: 700, letterSpacing: "0.1em", border: "1px solid #ff4d00", padding: "4px 10px" }}>BETA</div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Headline */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
            محتوى يشتغل<br />
            <span style={{ color: "#ff4d00" }}>بالعربي والإنجليزي</span>
          </h1>
          <p style={{ color: "#555", fontSize: 14, letterSpacing: "0.02em" }}>Generate scroll-stopping content for X & TikTok — instantly</p>
        </div>

        {/* Topic Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#666", marginBottom: 8 }}>TOPIC / الموضوع</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
            placeholder="اكتب موضوعك هنا... e.g. 'كيف تبني دخل سلبي من الإنترنت'"
            rows={3}
            style={{
              width: "100%",
              background: "#0e0e18",
              border: "1px solid #1e1e2e",
              color: "#f0ede8",
              padding: "14px 16px",
              fontSize: 15,
              fontFamily: "'Tajawal', 'Syne', sans-serif",
              lineHeight: 1.7,
              direction: "rtl",
              transition: "border-color 0.2s",
            }}
          />
        </div>

        {/* Content Type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#666", marginBottom: 10 }}>CONTENT TYPE</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CONTENT_TYPES.map(t => (
              <div
                key={t.id}
                className={`chip ${selectedType === t.id ? "active" : ""}`}
                onClick={() => setSelectedType(t.id)}
                style={{
                  padding: "8px 18px",
                  border: "1px solid #2a2a3a",
                  fontSize: 13,
                  fontWeight: 600,
                  background: selectedType === t.id ? "#ff4d00" : "#111118",
                  color: selectedType === t.id ? "#fff" : "#888",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#666", marginBottom: 10 }}>TONE / الأسلوب</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONES.map(t => (
              <div
                key={t.id}
                className={`chip ${selectedTone === t.id ? "active" : ""}`}
                onClick={() => setSelectedTone(t.id)}
                style={{
                  padding: "7px 16px",
                  border: "1px solid #2a2a3a",
                  fontSize: 12,
                  fontWeight: 600,
                  background: selectedTone === t.id ? "#ff4d00" : "transparent",
                  color: selectedTone === t.id ? "#fff" : "#666",
                  letterSpacing: "0.06em",
                }}
              >
                {t.label} / {t.labelEn}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <button className="gen-btn" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="loading-dot">●</span>
                <span className="loading-dot">●</span>
                <span className="loading-dot">●</span>
              </span>
            ) : "⚡ GENERATE CONTENT"}
          </button>
        </div>

        {/* Results */}
        {result && !result.error && (
          <div className="fade-in">
            <div style={{ borderTop: "1px solid #1a1a24", paddingTop: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#444" }}>OUTPUT</div>
                <div style={{ display: "flex", gap: 0 }}>
                  <div className={`tab ${activeTab === "ar" ? "active" : ""}`} onClick={() => setActiveTab("ar")}>العربي</div>
                  <div className={`tab ${activeTab === "en" ? "active" : ""}`} onClick={() => setActiveTab("en")}>English</div>
                </div>
              </div>

              {activeTab === "ar" && result.arabic && (
                <div className="fade-in">
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                    <button
                      className={`copy-btn ${copied === "ar" ? "copied" : ""}`}
                      onClick={() => copyToClipboard(result.arabic.content, "ar")}
                    >
                      {copied === "ar" ? "✓ COPIED" : "COPY"}
                    </button>
                  </div>
                  <div className="result-box" style={{ fontFamily: "'Tajawal', sans-serif", direction: "rtl", textAlign: "right", fontSize: 16 }}>
                    {result.arabic.content}
                  </div>
                  {result.arabic.tip && (
                    <div className="tip-box" style={{ fontFamily: "'Tajawal', sans-serif", direction: "rtl", textAlign: "right" }}>
                      💡 {result.arabic.tip}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "en" && result.english && (
                <div className="fade-in">
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                    <button
                      className={`copy-btn ${copied === "en" ? "copied" : ""}`}
                      onClick={() => copyToClipboard(result.english.content, "en")}
                    >
                      {copied === "en" ? "✓ COPIED" : "COPY"}
                    </button>
                  </div>
                  <div className="result-box">
                    {result.english.content}
                  </div>
                  {result.english.tip && (
                    <div className="tip-box">
                      💡 {result.english.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {result?.error && (
          <div style={{ textAlign: "center", color: "#ff4d00", fontSize: 14 }}>{result.error}</div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111", padding: "16px 32px", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: "0.08em" }}>CONTENTENGINE — POWERED BY AI</div>
      </div>
    </div>
  );
}

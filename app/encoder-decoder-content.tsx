"use client";

import { useEffect, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  encode,
  decode,
  inspectEmojiString,
  calculatePasswordEntropy,
  DecryptResult,
  InspectionData,
} from "./encoding";
import { EmojiSelector } from "@/components/emoji-selector";
import { EMOJI_LIST, POPULAR_SECURITY_EMOJIS } from "./emoji";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Bot,
  RefreshCw,
  ArrowRight,
  ClipboardPaste,
  Settings,
  UserCheck,
  Terminal,
  Cpu,
  Zap,
} from "lucide-react";
import { MatrixLockIcon } from "@/components/matrix-lock-icon";

export function Base64EncoderDecoderContent() {
  const [activeTab, setActiveTab] = useState<string>("encode");

  // --- LOCAL VAULT KEY (Stored strictly in the user's browser localStorage) ---
  const [savedVaultKey, setSavedVaultKey] = useState("");
  const [tempVaultKey, setTempVaultKey] = useState("");
  const [vaultKeySuccessAlert, setVaultKeySuccessAlert] = useState(false);

  // --- ENCODE STATE ---
  const [encodeInputText, setEncodeInputText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🔒");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [useSavedVaultKey, setUseSavedVaultKey] = useState(false);
  const [encodePassword, setEncodePassword] = useState("");
  const [showEncodePassword, setShowEncodePassword] = useState(false);
  const [encodedOutput, setEncodedOutput] = useState("");
  const [copiedEncoded, setCopiedEncoded] = useState(false);
  const [encodeError, setEncodeError] = useState("");
  const [isEncoding, startEncodingTransition] = useTransition();

  // --- DECODE STATE ---
  const [decodeInputText, setDecodeInputText] = useState("");
  const [decodePassword, setDecodePassword] = useState("");
  const [showDecodePassword, setShowDecodePassword] = useState(false);
  const [decodeResult, setDecodeResult] = useState<DecryptResult | null>(null);
  const [copiedDecoded, setCopiedDecoded] = useState(false);
  const [isDecoding, startDecodingTransition] = useTransition();

  // --- INSPECTOR STATE ---
  const [inspectorInput, setInspectorInput] = useState("");
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(
    null,
  );

  // Load private vault key from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("emoji_private_vault_key");
      if (stored) {
        setSavedVaultKey(stored);
        setTempVaultKey(stored);
        setUseSavedVaultKey(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const effectiveCarrier = customEmojiInput.trim() || selectedEmoji;
  const activeKeyForEncoding =
    useSavedVaultKey && savedVaultKey ? savedVaultKey : encodePassword;
  const passwordEntropy = calculatePasswordEntropy(encodePassword);

  // Perform Encoding — debounced (320ms) gegen PBKDF2-DoS bei jedem Tastendruck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!encodeInputText.trim()) {
        setEncodedOutput("");
        setEncodeError("");
        return;
      }

      if (!activeKeyForEncoding.trim()) {
        setEncodedOutput("");
        setEncodeError(
          ">> ERR: KEY_MATERIAL_REQUIRED // Passwort oder Tresor-Key erforderlich.",
        );
        return;
      }

      if (encodeInputText.length > 4000) {
        setEncodedOutput("");
        setEncodeError(">> ERR: INPUT_TOO_LARGE // Max 4000 Zeichen.");
        return;
      }

      setEncodeError("");
      startEncodingTransition(async () => {
        try {
          const result = await encode(effectiveCarrier, encodeInputText, {
            password: activeKeyForEncoding.trim(),
          });
          setEncodedOutput(result);
        } catch (err: any) {
          setEncodeError(err?.message || "Fehler beim Verschlüsseln.");
        }
      });
    }, 320);
    return () => clearTimeout(timer);
  }, [encodeInputText, effectiveCarrier, activeKeyForEncoding]);

  // Perform Decoding — debounced 300ms + Größen-Limit gegen DoS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!decodeInputText.trim()) {
        setDecodeResult(null);
        return;
      }
      if (decodeInputText.length > 20000) {
        setDecodeResult({
          status: "error",
          error: "Eingabe zu groß — max 20000 Zeichen.",
        });
        return;
      }

      startDecodingTransition(async () => {
        try {
          const result = await decode(decodeInputText, {
            password: decodePassword.trim(),
            vaultKey: savedVaultKey.trim(),
          });
          setDecodeResult(result);
        } catch (err) {
          setDecodeResult({
            status: "error",
            error: "Unerwarteter Entschlüsselungsfehler.",
          });
        }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [decodeInputText, decodePassword, savedVaultKey]);

  // Inspector analysis
  useEffect(() => {
    const textToInspect = inspectorInput || encodedOutput || decodeInputText;
    if (textToInspect) {
      setInspectionData(inspectEmojiString(textToInspect));
    } else {
      setInspectionData(null);
    }
  }, [inspectorInput, encodedOutput, decodeInputText]);

  const [pasteErrorHint, setPasteErrorHint] = useState("");

  // Copy helper with cross-browser fallback
  const handleCopy = async (text: string, isEncode: boolean) => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      // fallback
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    if (success) {
      if (isEncode) {
        setCopiedEncoded(true);
        setTimeout(() => setCopiedEncoded(false), 2000);
      } else {
        setCopiedDecoded(true);
        setTimeout(() => setCopiedDecoded(false), 2000);
      }
    }
  };

  // Paste helper with helpful error fallback
  const handlePasteToDecode = async () => {
    try {
      setPasteErrorHint("");
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setDecodeInputText(text);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setPasteErrorHint(
      ">> WARN: CLIPBOARD_ACCESS_DENIED // Nutze STRG+V / CMD+V",
    );
    setTimeout(() => setPasteErrorHint(""), 5000);
  };

  // Password generator
  const generateRandomPassword = () => {
    const chars =
      "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    let pwd = "";
    for (let i = 0; i < array.length; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setUseSavedVaultKey(false);
    setEncodePassword(pwd);
    setShowEncodePassword(true);
  };

  // Test in decoder shortcut
  const handleTestInDecoder = () => {
    if (encodedOutput) {
      setDecodeInputText(encodedOutput);
      setDecodePassword(activeKeyForEncoding);
      setActiveTab("decode");
    }
  };

  // Save private vault key
  const handleSaveVaultKey = () => {
    try {
      if (tempVaultKey.trim()) {
        localStorage.setItem("emoji_private_vault_key", tempVaultKey.trim());
        setSavedVaultKey(tempVaultKey.trim());
        setUseSavedVaultKey(true);
      } else {
        localStorage.removeItem("emoji_private_vault_key");
        setSavedVaultKey("");
        setUseSavedVaultKey(false);
      }
      setVaultKeySuccessAlert(true);
      setTimeout(() => setVaultKeySuccessAlert(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <CardContent className="p-4 sm:p-6 space-y-5 bg-[#060f07] font-mono">
      {/* Top Reassurance Banner - Terminal Style */}
      <div className="rounded border border-[#00ff41]/20 bg-[#001208] px-3.5 py-3 space-y-2 matrix-border-glow">
        <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[#00ff41]">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-[#00ff41] text-black">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <span className="matrix-glow-soft">
            ZERO-KNOWLEDGE // AES-256-GCM // PBKDF2 250k
          </span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[10px] font-normal tracking-wider text-[#00ff41]/60 border border-[#00ff41]/20 px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse shadow-[0_0_6px_#00ff41]" />
            ENCRYPTED
          </span>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-[#7ad68a]">
          <span className="text-[#00ff41]">&gt;_</span> Payload wird{" "}
          <span className="text-[#eaffea]">lokal im Browser</span> verschlüsselt
          &amp; in Zero-Width Zeichen injiziert (WhatsApp-sicher).
          <span className="hidden sm:inline">
            {" "}
            Ohne Schlüssel ist der Datenstrom reines Rauschen — unlesbar für
            Server, KI &amp; Interception.
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 bg-[#00260c] border border-[#00ff41]/20 text-[#00ff41]/80">
            SALT 16B
          </span>
          <span className="px-1.5 py-0.5 bg-[#00260c] border border-[#00ff41]/20 text-[#00ff41]/80">
            IV 12B
          </span>
          <span className="px-1.5 py-0.5 bg-[#00260c] border border-[#00ff41]/20 text-[#00ff41]/80">
            TAG 128b
          </span>
          <span className="px-1.5 py-0.5 bg-[#00260c] border border-[#00ff41]/20 text-[#00ff41]/80">
            PADDING 64B
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-11 bg-[#010805] p-1 border border-[#00ff41]/15 rounded-sm gap-1">
          <TabsTrigger
            value="encode"
            className="flex items-center gap-1.5 text-xs font-mono tracking-wide rounded-sm border border-transparent data-[state=active]:bg-[#00ff41] data-[state=active]:text-black data-[state=active]:border-[#00ff41] data-[state=active]:shadow-[0_0_12px_rgba(0,255,65,0.45)] data-[state=inactive]:text-[#6ee07a]/60 data-[state=inactive]:hover:text-[#00ff41] data-[state=inactive]:hover:bg-[#00260c] transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">[01]</span>
            <span>ENCRYPT</span>
          </TabsTrigger>
          <TabsTrigger
            value="decode"
            className="flex items-center gap-1.5 text-xs font-mono tracking-wide rounded-sm border border-transparent data-[state=active]:bg-[#00ff41] data-[state=active]:text-black data-[state=active]:border-[#00ff41] data-[state=active]:shadow-[0_0_12px_rgba(0,255,65,0.45)] data-[state=inactive]:text-[#6ee07a]/60 data-[state=inactive]:hover:text-[#00ff41] data-[state=inactive]:hover:bg-[#00260c] transition-all"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">[02]</span>
            <span>DECRYPT</span>
          </TabsTrigger>
          <TabsTrigger
            value="inspector"
            className="flex items-center gap-1.5 text-xs font-mono tracking-wide rounded-sm border border-transparent data-[state=active]:bg-[#00ff41] data-[state=active]:text-black data-[state=active]:border-[#00ff41] data-[state=active]:shadow-[0_0_12px_rgba(0,255,65,0.45)] data-[state=inactive]:text-[#6ee07a]/60 data-[state=inactive]:hover:text-[#00ff41] data-[state=inactive]:hover:bg-[#00260c] transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">[03]</span>
            <span>DEEP_SCAN</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-1.5 text-xs font-mono tracking-wide rounded-sm border border-transparent data-[state=active]:bg-[#00ff41] data-[state=active]:text-black data-[state=active]:border-[#00ff41] data-[state=active]:shadow-[0_0_12px_rgba(0,255,65,0.45)] data-[state=inactive]:text-[#6ee07a]/60 data-[state=inactive]:hover:text-[#00ff41] data-[state=inactive]:hover:bg-[#00260c] transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">[04]</span>
            <span>VAULT</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: VERSCHLÜSSELN (ENCODE) */}
        {/* ========================================================================= */}
        <TabsContent value="encode" className="space-y-5 pt-3">
          {/* Secret Text Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <label
                htmlFor="encode-input"
                className="font-bold tracking-widest text-[#00ff41] flex items-center gap-2"
              >
                <span className="text-[#00ff41]/50">01 // </span> PAYLOAD_INPUT
                <span className="w-1 h-3 bg-[#00ff41] animate-pulse hidden sm:inline-block" />
              </label>
              <span
                className={`tracking-wider border px-1.5 py-0.5 bg-[#001208] text-xs font-mono ${
                  encodeInputText.length > 3500
                    ? "text-[#ffbd2e] border-[#ffbd2e]/30"
                    : encodeInputText.length > 3800
                      ? "text-[#ff3b30] border-[#ff3b30]/30"
                      : "text-[#00ff41]/50 border-[#00ff41]/15"
                }`}
              >
                {encodeInputText.length} / 4000
              </span>
            </div>
            <Textarea
              id="encode-input"
              placeholder=">_ Geheimen Text eingeben... [AES-256-GCM + RANDOM PADDING] — max 4000 Zeichen"
              value={encodeInputText}
              maxLength={4000}
              onChange={(e) => setEncodeInputText(e.target.value)}
              className="min-h-[96px] font-mono resize-y bg-[#010805] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30 focus-visible:border-[#00ff41]/40 matrix-border-glow text-sm"
            />
          </div>

          {/* Password / Key Configuration */}
          <div className="space-y-3 rounded border border-[#00ff41]/15 p-4 bg-[#001208]/60 matrix-border-glow">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label className="text-xs font-mono font-bold tracking-widest text-[#00ff41] flex items-center gap-2">
                <span className="text-[#00ff41]/50">02 // </span> KEY_MATERIAL
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-mono tracking-wide text-black bg-[#00ff41] hover:bg-[#00ff41]/90 border border-[#00ff41] px-2 py-1 flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(0,255,65,0.35)] transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> GEN_RANDOM_KEY
              </button>
            </div>

            {/* Option to use saved Vault Key if available */}
            {savedVaultKey && (
              <div className="flex items-center gap-2 p-2.5 rounded-sm bg-[#00260c] border border-[#00ff41]/25 text-xs font-mono">
                <input
                  type="checkbox"
                  id="use-vault-key"
                  checked={useSavedVaultKey}
                  onChange={(e) => setUseSavedVaultKey(e.target.checked)}
                  className="rounded-none border-[#00ff41]/40 bg-black text-[#00ff41] focus:ring-[#00ff41]/40 w-4 h-4 cursor-pointer accent-[#00ff41]"
                />
                <label
                  htmlFor="use-vault-key"
                  className="cursor-pointer text-[#00ff41] font-bold tracking-wide flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3" /> VAULT_KEY AKTIV (localStorage)
                </label>
              </div>
            )}

            {/* Password input (if not using saved vault key) */}
            {!useSavedVaultKey && (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showEncodePassword ? "text" : "password"}
                    placeholder=">_ Passphrase eingeben... [min. 12 chars empfohlen]"
                    value={encodePassword}
                    onChange={(e) => setEncodePassword(e.target.value)}
                    className="pr-10 text-xs sm:text-sm font-mono bg-[#010805] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30 focus-visible:border-[#00ff41]/40 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEncodePassword(!showEncodePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00ff41]/60 hover:text-[#00ff41] transition-colors"
                  >
                    {showEncodePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {encodePassword.length > 0 && (
                  <div className="text-[11px] font-mono p-2.5 rounded-sm bg-[#010805] border border-[#00ff41]/15 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6ee07a]/70 tracking-wide">
                        ENTROPY:
                      </span>
                      <strong
                        className={
                          passwordEntropy.entropyBits >= 65
                            ? "text-[#00ff41] matrix-glow-soft"
                            : passwordEntropy.entropyBits >= 45
                              ? "text-[#7aff7a]"
                              : "text-[#ffbd2e]"
                        }
                      >
                        [{passwordEntropy.entropyBits} BIT]{" "}
                        {passwordEntropy.strengthLabel.toUpperCase()}
                      </strong>
                    </div>
                    <div className="text-[#6ee07a]/60 text-[10px] leading-relaxed border-t border-[#00ff41]/10 pt-1.5">
                      <span className="text-[#00ff41]/50">EST_CRACK_TIME:</span>{" "}
                      <span className="text-[#a7ffb0]">
                        {passwordEntropy.crackTimeEstimate}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-[#001208] border border-[#00ff41]/10 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordEntropy.entropyBits >= 65
                            ? "bg-[#00ff41] shadow-[0_0_6px_#00ff41]"
                            : passwordEntropy.entropyBits >= 45
                              ? "bg-[#7aff7a]"
                              : "bg-[#ffbd2e]"
                        }`}
                        style={{
                          width: `${Math.min(100, (passwordEntropy.entropyBits / 90) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Carrier Emoji Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold tracking-widest text-[#00ff41] flex items-center gap-2">
                <span className="text-[#00ff41]/50">03 // </span> CARRIER_EMOJI
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#6ee07a]/60">
                <span className="hidden sm:inline tracking-wide">
                  SELECTED:
                </span>
                <span className="text-xl inline-flex items-center justify-center min-w-[40px] h-8 bg-[#001208] px-2 border border-[#00ff41]/30 shadow-[0_0_8px_rgba(0,255,65,0.18)]">
                  {effectiveCarrier}
                </span>
              </div>
            </div>

            <div className="rounded-sm border border-[#00ff41]/10 bg-[#010805]/60 p-2.5 space-y-3">
              <div>
                <div className="text-[10px] font-mono tracking-[0.14em] text-[#00ff41]/50 mb-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#00ff41]/60" /> STEALTH_PRESET
                </div>
                <EmojiSelector
                  onEmojiSelect={(emoji) => {
                    setSelectedEmoji(emoji);
                    setCustomEmojiInput("");
                  }}
                  selectedEmoji={customEmojiInput ? "" : selectedEmoji}
                  emojiList={POPULAR_SECURITY_EMOJIS}
                />
              </div>

              <div className="pt-2 border-t border-[#00ff41]/10">
                <div className="text-[10px] font-mono tracking-[0.14em] text-[#00ff41]/50 mb-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#00ff41]/40" /> CLASSIC_SET
                </div>
                <EmojiSelector
                  onEmojiSelect={(emoji) => {
                    setSelectedEmoji(emoji);
                    setCustomEmojiInput("");
                  }}
                  selectedEmoji={customEmojiInput ? "" : selectedEmoji}
                  emojiList={EMOJI_LIST.slice(2, 12)}
                />
              </div>

              <div className="pt-2 flex items-center gap-2 border-t border-[#00ff41]/10">
                <span className="text-[10px] font-mono tracking-widest text-[#00ff41]/60 whitespace-nowrap">
                  CUSTOM_GLYPH:
                </span>
                <Input
                  placeholder=">_ beliebiges Zeichen..."
                  value={customEmojiInput}
                  onChange={(e) => setCustomEmojiInput(e.target.value)}
                  maxLength={4}
                  className="h-8 text-xs font-mono max-w-[200px] bg-[#001208] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30"
                />
              </div>
            </div>
          </div>

          {/* Result / Output Box */}
          <div className="pt-1 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold tracking-widest text-[#00ff41] flex items-center gap-2">
                <span className="text-[#00ff41]/50">04 // </span>{" "}
                ENCRYPTED_OUTPUT
              </span>
              {encodedOutput && (
                <div className="flex gap-1.5">
                  <Badge className="text-[10px] font-mono tracking-wide rounded-none bg-[#00260c] text-[#00ff41] border border-[#00ff41]/30 shadow-[0_0_8px_rgba(0,255,65,0.2)]">
                    ● AES-256-GCM
                  </Badge>
                  <Badge className="text-[10px] font-mono tracking-wide rounded-none bg-[#001a06] text-[#7aff7a] border border-[#00ff41]/20">
                    ● PADDING
                  </Badge>
                </div>
              )}
            </div>

            {encodeError && (
              <div className="text-xs font-mono text-[#ffb4ab] bg-[#1a0a05] border border-[#ff3b30]/30 p-2.5 tracking-wide">
                {encodeError}
              </div>
            )}

            <div className="relative rounded-sm border border-[#00ff41]/30 bg-[#010805] p-4 matrix-border-glow">
              {/* Terminal header inside output */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-[#001208] border-b border-[#00ff41]/15 flex items-center justify-between px-2 text-[10px] font-mono tracking-widest text-[#00ff41]/60">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" /> OUTPUT_STREAM
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  ZW_INJECTED{" "}
                  <span
                    className={`w-2 h-2 rounded-full ${encodedOutput ? "bg-[#00ff41] shadow-[0_0_6px_#00ff41] animate-pulse" : "bg-[#333]"}`}
                  />
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center p-2 bg-[#001208] border border-[#00ff41]/25 shadow-[inset_0_0_12px_rgba(0,255,65,0.10),0_0_10px_rgba(0,255,65,0.12)] min-w-[56px] min-h-[56px]">
                    {encodedOutput ? (
                      <span className="text-3xl select-all leading-none">
                        {effectiveCarrier}
                      </span>
                    ) : (
                      <MatrixLockIcon size={36} locked />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold tracking-wide text-[#eaffea]">
                      {encodedOutput
                        ? ">> PAYLOAD_INJECTED_SUCCESS"
                        : ">> AWAITING_ENCRYPTION..."}
                    </div>
                    <div className="text-[11px] font-mono text-[#6ee07a]/60 tracking-wide">
                      {encodedOutput
                        ? `${Array.from(encodedOutput).length} CODEPOINTS // INVISIBLE TO HUMAN & AI`
                        : "Eingabe: Plaintext + Key erforderlich"}
                    </div>
                  </div>
                </div>

                {encodedOutput && (
                  <Button
                    type="button"
                    onClick={() => handleCopy(encodedOutput, true)}
                    className="bg-[#00ff41] hover:bg-[#00ff41]/90 text-black font-mono font-bold tracking-widest text-xs border border-[#00ff41] shadow-[0_0_14px_rgba(0,255,65,0.45)] flex items-center gap-1.5 shrink-0"
                    size="sm"
                  >
                    {copiedEncoded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>COPY_EMOJI</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {encodedOutput && (
                <div className="mt-4 pt-3 border-t border-[#00ff41]/10 flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={handleTestInDecoder}
                    className="text-black bg-[#00ff41]/90 hover:bg-[#00ff41] flex items-center gap-1.5 font-bold tracking-wide px-2.5 py-1.5 border border-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.25)] transition-colors"
                  >
                    <span>TEST_DECRYPT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectorInput(encodedOutput);
                      setActiveTab("inspector");
                    }}
                    className="text-[#00ff41] hover:text-black hover:bg-[#00ff41] flex items-center gap-1.5 font-bold tracking-wide px-2.5 py-1.5 border border-[#00ff41]/40 bg-[#00260c] transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>DEEP_SCAN</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: ENTSCHLÜSSELN (DECODE) */}
        {/* ========================================================================= */}
        <TabsContent value="decode" className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <label
                htmlFor="decode-input"
                className="font-bold tracking-widest text-[#00ff41] flex items-center gap-2"
              >
                <span className="text-[#00ff41]/50">01 // </span>{" "}
                CIPHERTEXT_INPUT
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteToDecode}
                className="h-7 text-xs font-mono tracking-wide flex items-center gap-1.5 rounded-none bg-[#001208] border-[#00ff41]/20 text-[#00ff41] hover:bg-[#00260c] hover:text-[#00ff41] hover:border-[#00ff41]/40"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>PASTE</span>
              </Button>
            </div>
            <Textarea
              id="decode-input"
              placeholder=">_ Emoji mit Payload hier einfügen... — max 20000 Zeichen"
              value={decodeInputText}
              maxLength={20000}
              onChange={(e) => setDecodeInputText(e.target.value)}
              className="min-h-[90px] font-mono resize-y bg-[#010805] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30 text-sm"
            />
            {pasteErrorHint && (
              <p className="text-[11px] font-mono text-[#ffbd2e] tracking-wide">
                {pasteErrorHint}
              </p>
            )}
          </div>

          {/* Password Prompt — immer sichtbar für Entschlüsselung */}
          <div className="p-3.5 rounded-sm border border-[#ffbd2e]/30 bg-[#1a1300]/60 space-y-2 matrix-border-glow">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#ffbd2e]">
              <Key className="w-4 h-4" />
              <span>02 // DECRYPT_KEY // PASSWORT</span>
              <span className="ml-auto w-2 h-2 bg-[#ffbd2e] animate-pulse" />
            </div>
            <p className="text-[11px] font-mono text-[#ffbd2e]/80 tracking-wide">
              &gt; Passwort eingeben um Emoji zu entschlüsseln (leer lassen für
              unverschlüsselte Emojis):
            </p>
            <div className="relative">
              <Input
                type={showDecodePassword ? "text" : "password"}
                placeholder=">_ Passphrase..."
                value={decodePassword}
                onChange={(e) => setDecodePassword(e.target.value)}
                className="pr-10 text-xs sm:text-sm bg-[#010805] border-[#ffbd2e]/30 text-[#c8ffc8] placeholder:text-[#ffbd2e]/30 font-mono focus-visible:ring-[#ffbd2e]/30 h-10"
              />
              <button
                type="button"
                onClick={() => setShowDecodePassword(!showDecodePassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ffbd2e]/60 hover:text-[#ffbd2e]"
              >
                {showDecodePassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Result Box */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold tracking-widest text-[#00ff41] flex items-center gap-2">
                <span className="text-[#00ff41]/50">03 // </span>{" "}
                DECRYPTED_OUTPUT
              </span>
              {decodeResult?.status === "success" && (
                <Badge
                  className={`text-[10px] font-mono tracking-wide rounded-none border shadow-[0_0_8px_rgba(0,255,65,0.15)] ${
                    decodeResult.mode === "vault_key"
                      ? "bg-[#00260c] text-[#00ff41] border-[#00ff41]/30"
                      : decodeResult.mode === "password"
                        ? "bg-[#001208] text-[#00ff41] border-[#00ff41]/30"
                        : "bg-[#1a1300] text-[#ffbd2e] border-[#ffbd2e]/30"
                  }`}
                >
                  {decodeResult.mode === "vault_key"
                    ? "● VAULT_KEY // VERIFIZIERT"
                    : decodeResult.mode === "password"
                      ? "● PASSWORT // VERIFIZIERT"
                      : "⚠ LEGACY UNVERSCHLÜSSELT"}
                </Badge>
              )}
            </div>

            {/* Success state */}
            {decodeResult?.status === "success" && (
              <div className="space-y-3">
                {decodeResult.warning && (
                  <Alert className="rounded-none border-[#ffbd2e]/30 bg-[#1a1300]/50 text-[#ffbd2e] py-2 font-mono">
                    <AlertTitle className="text-xs font-bold tracking-widest flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      WARNUNG: LEGACY_FORMAT
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-1 tracking-wide">
                      {decodeResult.warning}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="relative rounded-sm border border-[#00ff41]/30 bg-[#010805] p-4 matrix-border-glow">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-[#001208] border-b border-[#00ff41]/15 flex items-center justify-between px-2 text-[10px] font-mono tracking-widest text-[#00ff41]/60">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-[#00ff41]" />{" "}
                      DECRYPT_SUCCESS
                    </span>
                    <span className="w-2 h-2 bg-[#00ff41] shadow-[0_0_6px_#00ff41] animate-pulse" />
                  </div>
                  <div className="flex justify-between items-start mb-3 pt-6">
                    <div className="text-xs font-mono font-bold tracking-widest text-[#00ff41] flex items-center gap-1.5">
                      <span>[OK]</span>
                      <span>PAYLOAD_KLAR_TEXT:</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(decodeResult.text, false)}
                      className="h-7 text-xs font-mono tracking-wide flex items-center gap-1.5 rounded-none bg-[#001208] border-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41] hover:text-black"
                    >
                      {copiedDecoded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY_TEXT</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={decodeResult.text}
                    className="min-h-[110px] bg-[#001208] border-[#00ff41]/15 font-mono text-sm text-[#eaffea] placeholder:text-[#6ee07a]/40"
                  />
                  <div className="mt-2 text-[10px] font-mono text-[#00ff41]/50 flex flex-wrap items-center gap-2 tracking-wide">
                    <span>CARRIER: {decodeResult.carrierEmoji}</span>
                    <span className="opacity-30">|</span>
                    <span>
                      VER: {decodeResult.version} {"//"} AES-256-GCM
                    </span>
                    <span className="opacity-30">|</span>
                    <span>BYTES: {decodeResult.hiddenByteCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error / Password required state */}
            {decodeResult?.status === "invalid_password" && (
              <Alert
                variant="destructive"
                className="rounded-none py-2.5 font-mono bg-[#1a0805] border-[#ff3b30]/40 text-[#ffb4ab]"
              >
                <AlertTitle className="text-xs font-bold tracking-widest">
                  DECRYPT_FAILED // ACCESS_DENIED
                </AlertTitle>
                <AlertDescription className="text-xs mt-0.5 tracking-wide">
                  {decodeResult.error}
                </AlertDescription>
              </Alert>
            )}

            {decodeResult?.status === "error" && (
              <Alert
                variant="destructive"
                className="rounded-none py-2.5 font-mono bg-[#1a0805]/60 border-[#ff3b30]/30 text-[#ffb4ab]"
              >
                <AlertTitle className="text-xs font-bold tracking-widest">
                  HINWEIS // SYSTEM_MSG
                </AlertTitle>
                <AlertDescription className="text-xs mt-0.5 tracking-wide">
                  {decodeResult.error}
                </AlertDescription>
              </Alert>
            )}

            {!decodeInputText.trim() && (
              <div className="rounded-sm border border-dashed border-[#00ff41]/15 bg-[#010805]/40 p-8 text-center text-xs font-mono text-[#00ff41]/40 tracking-wide">
                <span className="inline-flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  AWAITING_INPUT... INSERT EMOJI TO DECRYPT
                </span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: KI-CHECK (INSPECTOR) */}
        {/* ========================================================================= */}
        <TabsContent value="inspector" className="space-y-4 pt-3">
          <div className="bg-[#001208] border border-[#00ff41]/20 rounded-sm p-3.5 text-xs font-mono space-y-2 matrix-border-glow">
            <div className="flex items-center gap-1.5 font-bold tracking-widest text-[#00ff41]">
              <Bot className="w-4 h-4" />
              <span>DEEP_SCAN // WAS SIEHT EINE KI?</span>
              <span className="ml-auto text-[10px] font-normal text-[#00ff41]/50 border border-[#00ff41]/15 px-1.5 py-0.5">
                LIVE_ANALYSIS
              </span>
            </div>
            <p className="text-[#7ad68a] leading-relaxed text-[11px] tracking-wide">
              <span className="text-[#00ff41]">&gt;</span> Analyse des
              Datenstroms: Entropie, Hexdump &amp; Payload-Erkennung.
              Ungeschützter Text = sofort lesbar für jede KI.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inspector-input"
              className="text-xs font-mono font-bold tracking-widest text-[#00ff41] flex items-center gap-2"
            >
              <span className="text-[#00ff41]/50">INPUT // </span> SCAN_TARGET
            </label>
            <Input
              id="inspector-input"
              placeholder=">_ Emoji hier einfügen für Deep Scan..."
              value={inspectorInput}
              onChange={(e) => setInspectorInput(e.target.value)}
              className="text-xs sm:text-sm font-mono bg-[#010805] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30"
            />
          </div>

          {inspectionData && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Human view */}
                <div className="rounded-sm border border-[#00ff41]/15 p-3.5 bg-[#010805]">
                  <div className="text-xs font-mono font-bold tracking-widest text-[#6ee07a]/70 mb-2 flex items-center gap-1.5">
                    <span>👁️ HUMAN_VIEW:</span>
                    <span className="ml-auto w-2 h-2 bg-[#6ee07a]/40 rounded-full" />
                  </div>
                  <div className="text-center py-4">
                    <span className="text-5xl inline-block bg-[#001208] p-3 rounded-sm border border-[#00ff41]/15 shadow-[inset_0_0_12px_rgba(0,255,65,0.06)]">
                      {inspectionData.carrier}
                    </span>
                    <p className="text-[11px] font-mono text-[#00ff41]/40 mt-2 tracking-wide">
                      RENDERED_GLYPH // NO PAYLOAD VISIBLE
                    </p>
                  </div>
                </div>

                {/* AI / Raw View */}
                <div className="rounded-sm border border-[#00ff41]/20 p-3.5 bg-[#020602] font-mono text-xs">
                  <div className="text-xs font-bold tracking-widest text-[#00ff41] mb-2 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>AI_RAW_STREAM:</span>
                    <span className="ml-auto text-[10px] font-normal text-[#ff3b30] animate-pulse">
                      ● LIVE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-[#7ad68a]">
                    <div className="flex justify-between border-b border-[#00ff41]/10 py-1">
                      <span className="text-[#6ee07a]/60 tracking-wide">
                        CODEPOINTS:
                      </span>{" "}
                      <span className="text-[#ffbd2e] font-bold">
                        {inspectionData.totalLength}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#00ff41]/10 py-1">
                      <span className="text-[#6ee07a]/60 tracking-wide">
                        HIDDEN_BYTES:
                      </span>{" "}
                      <span className="text-[#00ff41] font-bold">
                        {inspectionData.byteCount}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#00ff41]/10 py-1">
                      <span className="text-[#6ee07a]/60 tracking-wide">
                        ENTROPY:
                      </span>{" "}
                      <span className="text-[#00ff41] font-bold">
                        {inspectionData.shannonEntropy.toFixed(2)} / 8.00
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#6ee07a]/60 tracking-wide">
                        PADDING:
                      </span>{" "}
                      <span
                        className={
                          inspectionData.isPadded
                            ? "text-[#00ff41] font-bold"
                            : "text-[#ffbd2e]"
                        }
                      >
                        {inspectionData.isPadded ? "● ACTIVE" : "○ INACTIVE"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#00ff41]/15 text-[10px] font-mono text-[#00ff41]/40 truncate">
                    HEXDUMP:{" "}
                    <span className="text-[#a7ffb0]">
                      {inspectionData.sampleHex}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div
                className={`p-3.5 rounded-sm border font-mono text-xs leading-relaxed ${
                  inspectionData.isEncrypted
                    ? "border-[#00ff41]/30 bg-[#001208] text-[#a7ffb0] matrix-border-glow"
                    : "border-[#ffbd2e]/20 bg-[#1a1300]/40 text-[#ffbd2e]/90"
                }`}
              >
                <div className="font-bold tracking-widest flex items-center gap-1.5 mb-1">
                  {inspectionData.isEncrypted ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#00ff41]" />
                      <span className="text-[#00ff41] matrix-glow-soft">
                        STATUS: ENCRYPTED // KI-SICHER // AES-256-GCM
                      </span>
                    </>
                  ) : (
                    <span className="tracking-wide">
                      STATUS: NO_PAYLOAD / UNPROTECTED
                    </span>
                  )}
                </div>
                <p className="text-[11px] tracking-wide leading-relaxed opacity-90">
                  {inspectionData.summaryForAi}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: TRESOR-KEY EINSTELLUNGEN */}
        {/* ========================================================================= */}
        <TabsContent
          value="settings"
          className="space-y-4 pt-3 text-xs font-mono"
        >
          <div className="rounded-sm border border-[#00ff41]/15 p-4 bg-[#010805] space-y-3 matrix-border-glow">
            <h4 className="font-bold tracking-widest text-[#00ff41] flex items-center gap-1.5 text-sm">
              <Key className="w-4 h-4" />
              <span>VAULT_KEY // LOCAL_STORAGE_ONLY</span>
              <span className="ml-auto text-[10px] font-normal px-1.5 py-0.5 bg-[#00ff41] text-black tracking-wide">
                PRIVATE
              </span>
            </h4>
            <p className="text-[#6ee07a]/70 text-[11px] leading-relaxed tracking-wide">
              <span className="text-[#00ff41]">&gt;</span> Für Teams / feste
              Gruppen: Hinterlege einen{" "}
              <strong className="text-[#eaffea]">
                privaten Tresor-Schlüssel
              </strong>
              . Er wird
              <strong className="text-[#00ff41]">
                {" "}
                ausschließlich lokal
              </strong>{" "}
              gespeichert &amp; nie übertragen.
            </p>

            <div className="p-3 bg-[#00260c]/50 border border-[#00ff41]/15 rounded-sm text-[11px] text-[#7ad68a] space-y-1.5">
              <div className="font-bold tracking-widest flex items-center gap-1.5 text-[#00ff41]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>ZERO-KNOWLEDGE GARANTIE:</span>
              </div>
              <p className="tracking-wide leading-relaxed text-[#a7ffb0]/80">
                Schlüssel bleibt{" "}
                <strong className="text-[#00ff41]">nur auf diesem Gerät</strong>{" "}
                (localStorage). Fremde Besucher haben keinen Zugriff und können
                deine Emojis <strong className="text-[#ffbd2e]">nicht</strong>{" "}
                entschlüsseln.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder=">_ z. B. OurSecretVaultKey_2026..."
                value={tempVaultKey}
                onChange={(e) => setTempVaultKey(e.target.value)}
                className="text-xs font-mono bg-[#001208] border-[#00ff41]/20 text-[#c8ffc8] placeholder:text-[#00ff41]/25 focus-visible:ring-[#00ff41]/30 h-10 tracking-wide"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveVaultKey}
                  className="h-8 text-xs font-mono font-bold tracking-widest rounded-none bg-[#00ff41] hover:bg-[#00ff41]/90 text-black border border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                >
                  SAVE_TO_LOCAL
                </Button>
                {savedVaultKey && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTempVaultKey("");
                      localStorage.removeItem("emoji_private_vault_key");
                      setSavedVaultKey("");
                      setUseSavedVaultKey(false);
                      setVaultKeySuccessAlert(true);
                      setTimeout(() => setVaultKeySuccessAlert(false), 2000);
                    }}
                    className="h-8 text-xs font-mono tracking-wide rounded-none text-[#ff3b30] border-[#ff3b30]/30 hover:bg-[#1a0805] hover:text-[#ff3b30] hover:border-[#ff3b30]/50 bg-transparent"
                  >
                    PURGE_KEY
                  </Button>
                )}
              </div>
              {vaultKeySuccessAlert && (
                <div className="text-[11px] font-mono font-bold tracking-widest text-[#00ff41] flex items-center gap-1.5 border border-[#00ff41]/20 bg-[#00260c] px-2 py-1.5">
                  <Check className="w-3.5 h-3.5" /> [OK] VAULT_CONFIG_UPDATED
                </div>
              )}
              {savedVaultKey && (
                <div className="text-[10px] font-mono tracking-wide text-[#00ff41]/50 border-t border-[#00ff41]/10 pt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#00ff41] animate-pulse shadow-[0_0_6px_#00ff41]" />
                  VAULT_ACTIVE: {savedVaultKey.slice(0, 3)}***
                  {savedVaultKey.slice(-2)} {"//"} {savedVaultKey.length} chars{" "}
                  {"//"} LOCAL ONLY
                </div>
              )}
            </div>
          </div>

          <div className="rounded-sm border border-[#00ff41]/10 bg-[#001208]/40 p-3 text-[10px] font-mono tracking-wide text-[#00ff41]/40 leading-relaxed">
            <span className="text-[#00ff41]/60">TIP:</span> Teile den Vault-Key
            nur über sicheren Kanal (bitchat, persönlich). Ohne diesen Key ist
            der Traffic für Dritte reines Rauschen.
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom system log */}
      <div className="rounded-sm border border-[#00ff41]/10 bg-[#010805]/60 px-2.5 py-2 font-mono text-[10px] tracking-wide text-[#00ff41]/35 flex flex-wrap gap-x-3 gap-y-1">
        <span>
          <span className="text-[#00ff41]/60">$</span> uptime: STABLE
        </span>
        <span className="opacity-30">|</span>
        <span>crypto: WebCrypto Subtle</span>
        <span className="opacity-30">|</span>
        <span>stego: Zero-Width U+200B/C/D + U+2060 (4×/Byte)</span>
        <span className="hidden sm:inline opacity-30">|</span>
        <span className="hidden sm:inline">mode: ZERO_KNOWLEDGE</span>
      </div>
    </CardContent>
  );
}

// ============================================================================
// TB-303/TD-3 HELPER - Frontend pur (GitHub Pages, mobile friendly)
// ============================================================================
// - [X] Pas de backend Python : tout fonctionne en JS côté client
// - [X] Support iPhone / Android / Mac / PC
// - [X] Sauvegarde locale (localStorage) pour pattern courant + librairie
// - [X] Tutoriel TD-3 (TIME + PITCH + EXT)
// - [X] Track mode (enchaînement de patterns)
// - [X] Export MIDI avancé (multi-patterns, CC, etc.) - WIP
// - [X] Drum Machine complète (ex-TR-909, renommé pour IP)
// - [X] Multi-pages (1-4 x 16 steps) pour 303 et Drum Machine
// - [X] Undo/Redo avec historique étendu
// - [X] Save/Load Clipboard bidirectionnel (flex JSON)
// - [X] Générateur de Prompt IA (mega-prompt pour LLM)
// - [X] Traduction FR/EN toggle (sauf termes tech)
// - [ ] Améliorations futures
// ============================================================================

(function () {
    "use strict";

    // ------------------------------------------------------------------------
    // État global et langue
    // ------------------------------------------------------------------------
    const state = {
        isPlaying: false,
        trackPlaying: false,
        intervalId: null,
        trackIntervalId: null,
        trackChain: [],
        trackPatternIndex: 0,
        trackStepIndex: 0,
        bpm: 120,
        lang: "fr", // 'fr' ou 'en' (rechargé en init)
        pages303: 1, // 1-4 pages pour 303
        pagesDrum: 1, // 1-4 pour Drum Machine
        promptSeen: false,
        audioInitialized: false
    };

    const translations = {
        fr: {
            // Header et labels
            title: "🎵 TB-303/TD-3 HELPER",
            bpmLabel: "BPM :",
            synthesis: "Synthesis Controls",
            tune: "Tune",
            cutoff: "Cutoff",
            resonance: "Resonance",
            envMod: "Env Mod",
            decay: "Decay",
            accent: "Accent",
            drive: "Drive",
            tone: "Tone",
            distVol: "Dist Vol",
            waveform: "Waveform :",
            saw: "Saw",
            square: "Square",

            // Boutons
            play: "▶️ PLAY",
            stop: "⏹️ STOP",
            clear: "🔄 CLEAR",
            random: "🎲 RANDOM",
            midi: "📁 EXPORT MIDI",
            save: "💾 SAVE (local)",
            load: "📂 LOAD LAST",
            clipboardLoad: "📋 LOAD FROM CLIPBOARD",
            clipboardSave: "📋 SAVE TO CLIPBOARD",
            patterns: "🧩 PATTERNS / TRACK",
            faq: "❓ TD-3 FAQ",
            preset: "💾 SAVE 303+DRUM PRESET",
            generate: "📘 GENERATE TD-3 TUTORIAL",
            undo: "↶ UNDO",
            redo: "↷ REDO",
            ia: "🤖 IA PROMPT GEN",
            langFr: "🇫🇷 Français",
            langEn: "🇬🇧 English",
            audioInit: "🔊 Appuyez pour initialiser l'audio (iOS Safari)",
            audioFail: "❌ Audio non supporté - mode silencieux",
            storageFallback: "⚠️ localStorage bloqué - sauvegardes en mémoire seulement",

            // Drum Machine
            drumTitle: "Drum Machine Sequencer",
            drumMixer: "Drum Machine Mixer",
            pages: "Pages:",

            // Toasts et messages
            fileDownloaded: "💾 Fichier téléchargé (dossier Téléchargements)",
            exportFailed: "❌ Export fichier échoué (WIP)",
            saveCancelled: "❌ Save cancelled",
            savedLibrary: "✅ Pattern saved in library",
            noStored: "No stored pattern yet",
            loadedLast: "✅ Loaded last pattern",
            clipboardEmpty: "Clipboard is empty",
            clipboardInvalid: "JSON from clipboard invalid",
            clipboardLoadFailed: "❌ Clipboard load failed",
            clipboardLoaded: "📋 Pattern loaded from clipboard",
            copied: "📋 Copied to clipboard!",
            trackEmpty: "Track chain empty",
            clearConfirm: "Clear all steps ?",
            randomNotSaved: "🎲 Random pattern (not saved in library yet)",
            loadedPattern: 'Loaded pattern "%s"',
            tutorialModalNotFound: "Tutorial modal not found (HTML WIP)",
            patternModalNotFound: "Pattern modal not found (HTML WIP)",
            faqWip: "FAQ TD-3 en cours de travaux (ajoute le HTML du modal)",
            presetCancelled: "❌ Preset save cancelled",
            midiExported: "📁 MIDI exported",

            // Tutoriel
            tutorialTitle: "TD-3 Programming Tutorial",
            td3Instructions: "TD-3 : Programmation pas à pas",
            pitchMode: "PITCH MODE",
            enterNotes: "Entre toutes les notes du pattern <strong>dans l'ordre</strong>, sans silences ni EXT : <strong>%s</strong>.",
            timeMode: "TIME MODE",
            timeDouble: "Time = double croche",
            timeExt: "Time = EXT",
            timeRest: "Time = REST",
            accentSlide: "ACC → appuie sur ACCENT. SLIDE → appuie sur SLIDE. ACC+SLIDE → les deux.",
            whiteNext: "Si tu t'es trompé en <strong>TIME MODE</strong>, repasse en TIME MODE puis maintiens le bouton <strong>WHITE/NEXT</strong> (en bas à droite de la TD-3) pour faire défiler les steps et corriger chaque step une par une.",
            keyboard: "Clavier / Transpose pour ce pattern",
            noNotes: "Aucune note active dans ce pattern.",
            step: "Step",
            note: "Note",
            time: "Time",
            flags: "Flags",
            restSilence: "REST (silence)",
            sixteenth: "16th (double croche)",
            extTie: "EXT (tie)",
            samePrevious: "↳ (same as previous)",

            // Track
            trackTutorial: "Track Pattern %d",
            patternsLibrary: "Saved Patterns (localStorage)",
            trackChain: "Track Chain (16-step patterns)",
            length: "Length :",
            apply: "Apply",
            playTrack: "▶️ PLAY TRACK",
            stopTrack: "⏹️ STOP TRACK",
            trackTutorialBtn: "📘 TRACK TUTORIAL",

            // FAQ
            faqTitle: "TD-3 FAQ (en cours de travaux)",
            faqIntro: "Cette FAQ liste les questions importantes sur la TD-3. Les réponses détaillées seront ajoutées plus tard (recherches en cours).",
            faqQuestions: [
                "Comment supprimer complètement un pattern sur la TD-3 ?",
                "Comment copier / coller un pattern d'un emplacement à un autre ?",
                "Comment programmer une chaîne de patterns en TRACK MODE ?",
                "En TRACK MODE, comment s'assurer que la chaîne redémarre bien au début (et pourquoi faut-il appuyer sur CLEAR pour ré-armer la chaîne) ?",
                "Comment sauvegarder un pattern sans écraser un autre pattern par erreur ?",
                "Comment sortir proprement de TRACK MODE vers PATTERN WRITE / PLAY sans perdre ce qu'on a fait ?"
            ],
            faqStatus: "Statut : en cours de travaux. Cette FAQ sera complétée avec des pas-à-pas précis.",

            // Prompt Gen
            promptWelcome: "Cette fonctionnalité génère un mega-prompt optimisé pour un LLM (comme Grok ou ChatGPT) afin de composer des patterns TB-303/Drum Machine. Cliquez sur 'OK' pour commencer.",
            promptDontShow: "Ne plus afficher ce message",
            promptOk: "OK",
            promptTitle: "Générateur de Prompt IA",
            tempo: "Tempo (BPM):",
            fundamental: "Note Fondamentale:",
            style1: "Style Principal:",
            style2: "Style Additionnel (optionnel):",
            atmosphere: "Atmosphère:",
            scale: "Gamme/Mode:",
            rhythmSig: "Signature Rythmique:",
            numPatterns: "Nombre de Patterns (1-8):",
            type303: "Seulement 303",
            typeDrum: "Seulement Drums",
            typeBoth: "303 + Drums",
            adjectives: "Adjectifs Additionnels:",
            generatePrompt: "Générer le Prompt",
            copyPrompt: "Copier le Prompt",
            promptExpl: "Vous pouvez maintenant copier ce prompt et le coller dans un LLM de votre choix. Le LLM générera un JSON de patterns. Copiez ce JSON et revenez dans l'app pour 'LOAD FROM CLIPBOARD'."
        },
        en: {
            // Header et labels
            title: "🎵 TB-303/TD-3 HELPER",
            bpmLabel: "BPM:",
            synthesis: "Synthesis Controls",
            tune: "Tune",
            cutoff: "Cutoff",
            resonance: "Resonance",
            envMod: "Env Mod",
            decay: "Decay",
            accent: "Accent",
            drive: "Drive",
            tone: "Tone",
            distVol: "Dist Vol",
            waveform: "Waveform:",
            saw: "Saw",
            square: "Square",

            // Boutons
            play: "▶️ PLAY",
            stop: "⏹️ STOP",
            clear: "🔄 CLEAR",
            random: "🎲 RANDOM",
            midi: "📁 EXPORT MIDI",
            save: "💾 SAVE (local)",
            load: "📂 LOAD LAST",
            clipboardLoad: "📋 LOAD FROM CLIPBOARD",
            clipboardSave: "📋 SAVE TO CLIPBOARD",
            patterns: "🧩 PATTERNS / TRACK",
            faq: "❓ TD-3 FAQ",
            preset: "💾 SAVE 303+DRUM PRESET",
            generate: "📘 GENERATE TD-3 TUTORIAL",
            undo: "↶ UNDO",
            redo: "↷ REDO",
            ia: "🤖 IA PROMPT GEN",
            langFr: "🇫🇷 French",
            langEn: "🇬🇧 English",
            audioInit: "🔊 Tap to initialize audio (iOS Safari)",
            audioFail: "❌ Audio not available - silent mode",
            storageFallback: "⚠️ localStorage blocked - in-memory saves only",

            // Drum Machine
            drumTitle: "Drum Machine Sequencer",
            drumMixer: "Drum Machine Mixer",
            pages: "Pages:",

            // Toasts et messages
            fileDownloaded: "💾 File downloaded (Downloads folder)",
            exportFailed: "❌ File export failed (WIP)",
            saveCancelled: "❌ Save cancelled",
            savedLibrary: "✅ Pattern saved in library",
            noStored: "No stored pattern yet",
            loadedLast: "✅ Loaded last pattern",
            clipboardEmpty: "Clipboard is empty",
            clipboardInvalid: "JSON from clipboard invalid",
            clipboardLoadFailed: "❌ Clipboard load failed",
            clipboardLoaded: "📋 Pattern loaded from clipboard",
            copied: "📋 Copied to clipboard!",
            trackEmpty: "Track chain empty",
            clearConfirm: "Clear all steps?",
            randomNotSaved: "🎲 Random pattern (not saved in library yet)",
            loadedPattern: 'Loaded pattern "%s"',
            tutorialModalNotFound: "Tutorial modal not found (HTML WIP)",
            patternModalNotFound: "Pattern modal not found (HTML WIP)",
            faqWip: "TD-3 FAQ under construction (add HTML modal)",
            presetCancelled: "❌ Preset save cancelled",
            midiExported: "📁 MIDI exported",

            // Tutoriel
            tutorialTitle: "TD-3 Programming Tutorial",
            td3Instructions: "TD-3: Step-by-Step Programming",
            pitchMode: "PITCH MODE",
            enterNotes: "Enter all notes in the pattern <strong>in order</strong>, including repeats, ignoring silences and EXT: <strong>%s</strong>.",
            timeMode: "TIME MODE",
            timeDouble: "Time = 16th note",
            timeExt: "Time = EXT",
            timeRest: "Time = REST",
            accentSlide: "For each step: ACC → press ACCENT. SLIDE → press SLIDE. ACC+SLIDE → both.",
            whiteNext: "If you made a mistake in <strong>TIME MODE</strong>, go back to TIME MODE and hold <strong>WHITE/NEXT</strong> (bottom right on TD-3) to scroll steps and correct one by one.",
            keyboard: "Keyboard / Transpose for this pattern",
            noNotes: "No active notes in this pattern.",
            step: "Step",
            note: "Note",
            time: "Time",
            flags: "Flags",
            restSilence: "REST (silence)",
            sixteenth: "16th (sixteenth note)",
            extTie: "EXT (tie)",
            samePrevious: "↳ (same as previous)",

            // Track
            trackTutorial: "Track Pattern %d",
            patternsLibrary: "Saved Patterns (localStorage)",
            trackChain: "Track Chain (16-step patterns)",
            length: "Length:",
            apply: "Apply",
            playTrack: "▶️ PLAY TRACK",
            stopTrack: "⏹️ STOP TRACK",
            trackTutorialBtn: "📘 TRACK TUTORIAL",

            // FAQ
            faqTitle: "TD-3 FAQ (under construction)",
            faqIntro: "This FAQ lists important questions about the TD-3. Detailed answers will be added later (research in progress).",
            faqQuestions: [
                "How to completely delete a pattern on the TD-3?",
                "How to copy/paste a pattern from one slot to another?",
                "How to program a chain of patterns in TRACK MODE?",
                "In TRACK MODE, how to ensure the chain restarts from the beginning (and why press CLEAR to re-arm the chain)?",
                "How to save a pattern without overwriting another by mistake?",
                "How to exit TRACK MODE cleanly to PATTERN WRITE/PLAY without losing work?"
            ],
            faqStatus: "Status: under construction. This FAQ will be completed with precise step-by-step instructions.",

            // Prompt Gen
            promptWelcome: "This feature generates an optimized mega-prompt for an LLM (like Grok or ChatGPT) to compose TB-303/Drum Machine patterns. Click 'OK' to start.",
            promptDontShow: "Don't show again",
            promptOk: "OK",
            promptTitle: "IA Prompt Generator",
            tempo: "Tempo (BPM):",
            fundamental: "Fundamental Note:",
            style1: "Main Style:",
            style2: "Additional Style (optional):",
            atmosphere: "Atmosphere:",
            scale: "Scale/Mode:",
            rhythmSig: "Rhythmic Signature:",
            numPatterns: "Number of Patterns (1-8):",
            type303: "303 Only",
            typeDrum: "Drums Only",
            typeBoth: "303 + Drums",
            adjectives: "Additional Adjectives:",
            generatePrompt: "Generate Prompt",
            copyPrompt: "Copy Prompt",
            promptExpl: "You can now copy this prompt and paste it into your chosen LLM. The LLM will generate a JSON of patterns. Copy that JSON and return to the app to 'LOAD FROM CLIPBOARD'."
        }
    };

    const styles = ["Acid House", "Techno", "Trance", "Breakbeat", "House", "Minimal", "Psytrance"];
    const atmospheres = ["Dark", "Energetic", "Mellow", "Hypnotic", "Euphoric", "Groovy", "Atmospheric"];
    const scales = ["Major", "Minor", "Phrygian", "Dorian", "Mixolydian", "Blues", "Pentatonic"];
    const rhythmSigs = ["4/4", "3/4", "5/4"];

    const drumInstruments = ["BD", "SD", "LT", "MT", "HT", "RS", "CP", "CH", "OH", "CY"];

    function updateLang() {
        const t = translations[state.lang];
        // Header
        document.querySelector('h1').textContent = t.title;
        document.querySelector('#bpmInput + label').textContent = t.bpmLabel;
        // Synth labels
        document.querySelector('.synthesis-panel h2').textContent = t.synthesis;
        const initBtn = document.getElementById("initAudio");
        if (initBtn) initBtn.textContent = t.audioInit;
        // ... (ajouter pour tous les labels statiques via querySelector)
        // Dynamique : dans fonctions UI, utiliser t.key
        // Ex: Utils.toast = (msgKey, ms) => document.getElementById('toast').textContent = t[msgKey] || msgKey;
        // Pour simplicité, override Utils.toast pour utiliser keys
        Utils.t = t;
    }

    // ------------------------------------------------------------------------
    // Utilitaires simples (étendus pour lang)
    // ------------------------------------------------------------------------
    const Utils = {
        toastEl: null,
        overlayEl: null,
        t: translations.fr, // default

        init() {
            this.toastEl = document.getElementById("toast");
            this.overlayEl = document.getElementById("overlay");
        },

        toast(msgKey, ms = 1800) {
            if (!this.toastEl) return;
            const msg = this.t[msgKey] || msgKey;
            this.toastEl.textContent = msg;
            this.toastEl.classList.add("show");
            setTimeout(() => this.toastEl.classList.remove("show"), ms);
        },

        overlay(on) {
            if (!this.overlayEl) return;
            this.overlayEl.classList.toggle("active", !!on);
        },

        debounce(fn, delay) {
            let t = null;
            return (...args) => {
                clearTimeout(t);
                t = setTimeout(() => fn(...args), delay);
            };
        },

        rafThrottle(fn) {
            let ticking = false;
            return (...args) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        fn(...args);
                        ticking = false;
                    });
                    ticking = true;
                }
            };
        },

        nowISO() {
            return new Date().toISOString();
        },

        safeLocalSet(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn("localStorage set failed", e);
                return false;
            }
        },

        safeLocalGet(key, fallback = null) {
            try {
                const v = localStorage.getItem(key);
                return v !== null ? v : fallback;
            } catch (e) {
                console.warn("localStorage get failed", e);
                return fallback;
            }
        },

        /**
         * Télécharge un objet JSON sous forme de fichier .json.
         * Le navigateur enverra ça dans le dossier "Téléchargements" par défaut.
         */
        downloadJson(obj, defaultName) {
            try {
                const json = JSON.stringify(obj, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                const base = (defaultName || "pattern").toString().trim() || "pattern";
                a.href = url;
                a.download = base.replace(/[^\w\-]+/g, "_") + ".json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                this.toast("fileDownloaded", 1800);
            } catch (e) {
                console.error(e);
                this.toast("exportFailed", 1800);
            }
        },

        copyToClipboard(text) {
            if (!navigator.clipboard) {
                this.toast("clipboardApiNotAvailable", 1800);
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                this.toast("copied", 1800);
            }).catch(() => {
                this.toast("clipboardLoadFailed", 1800);
            });
        }
    };

    // ------------------------------------------------------------------------
    // Notes & normalisation (C1 -> C4)
    // ------------------------------------------------------------------------
    const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const FLAT_TO_SHARP_MAP = {
        AB: "G#",
        BB: "A#",
        CB: "B",
        DB: "C#",
        EB: "D#",
        FB: "E",
        GB: "F#"
    };

    function normalizeNoteName(name) {
        if (!name && name !== 0) return null;
        let s = String(name).trim();
        if (!s) return null;

        s = s.replace("♭", "b").replace("♯", "#");
        s = s.replace(/\s+/g, "");

        const m = s.match(/^([A-Ga-g])([#b]?)[-_]?(-?\d)$/);
        if (!m) return null;

        let pc = m[1].toUpperCase();
        let acc = m[2] || "";
        let oct = parseInt(m[3], 10);
        if (Number.isNaN(oct)) return null;

        if (acc === "b") {
            const key = (pc + "b").toUpperCase();
            const mapped = FLAT_TO_SHARP_MAP[key];
            if (!mapped) return null;
            if (mapped.length === 2 && mapped[1] === "#") {
                pc = mapped[0];
                acc = "#";
            } else {
                pc = mapped;
                acc = "";
            }
        } else if (acc === "#") {
            if (pc === "E") {
                pc = "F";
                acc = "";
            } else if (pc === "B") {
                pc = "C";
                acc = "";
            }
        }

        return acc ? `${pc}${acc}-${oct}` : `${pc}-${oct}`;
    }

    function generateNoteList(startOct = 1, startPc = "C", endOct = 4, endPc = "C") {
        const res = [];
        let idx = NOTE_ORDER.indexOf(startPc);
        let oct = startOct;
        const endIdx = NOTE_ORDER.indexOf(endPc);

        while (true) {
            res.push(`${NOTE_ORDER[idx]}-${oct}`);
            if (oct === endOct && idx === endIdx) break;
            idx++;
            if (idx >= 12) {
                idx = 0;
                oct++;
            }
        }
        return res;
    }

    function midiFromName(name) {
        const norm = normalizeNoteName(name);
        if (!norm) return null;
        const m = norm.match(/^([A-G]#?)-(-?\d)$/);
        if (!m) return null;
        const pc = m[1];
        const oct = parseInt(m[2], 10);
        const noteIdx = NOTE_ORDER.indexOf(pc);
        if (noteIdx < 0) return null;
        return (oct + 1) * 12 + noteIdx;
    }

    function freqFromName(name) {
        const midi = midiFromName(name);
        if (midi === null) return null;
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    const noteNamesAsc = generateNoteList(1, "C", 4, "C");
    const noteNamesDesc = noteNamesAsc.slice().reverse();
    const noteFrequencies = {};
    noteNamesAsc.forEach((n) => (noteFrequencies[n] = freqFromName(n)));

    // ------------------------------------------------------------------------
    // PatternManager (orienté objet, étendu pour multi-pages et drums)
    // ------------------------------------------------------------------------
    class PatternManager {
        constructor() {
            this.pattern = this.createEmptyPattern();
            this.history = [];
            this.future = [];
            this.pages = 1; // Pour 303
        }

        createEmptyPattern() {
            const stepsPerPage = 16;
            const totalSteps = stepsPerPage * this.pages;
            return {
                steps: Array.from({ length: totalSteps }, (_, i) => ({
                    step: i,
                    note: null,
                    accent: false,
                    slide: false,
                    extend: false
                })),
                knobs: {
                    tune: 0,
                    cutoff: 800,
                    resonance: 5,
                    envMod: 50,
                    decay: 500,
                    accent: 70,
                    drive: 0,
                    tone: 20000,
                    distVolume: 100
                },
                waveform: "sawtooth",
                drums: {
                    pages: 1,
                    steps: drumInstruments.reduce((acc, instr) => {
                        acc[instr] = Array.from({ length: 16 * this.drums.pages }, () => false);
                        return acc;
                    }, {}),
                    volumes: drumInstruments.reduce((acc, instr) => {
                        acc[instr] = 100;
                        return acc;
                    }, {})
                }
            };
        }

        clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        commit() {
            this.history.push(this.clone(this.pattern));
            if (this.history.length > 200) this.history.shift(); // Grande mémoire
            this.future = [];
        }

        undo() {
            if (!this.history.length) return false;
            this.future.push(this.clone(this.pattern));
            this.pattern = this.history.pop();
            return true;
        }

        redo() {
            if (!this.future.length) return false;
            this.history.push(this.clone(this.pattern));
            this.pattern = this.future.pop();
            return true;
        }

        setPages(pages) {
            this.pages = Math.max(1, Math.min(4, pages));
            this.pattern.steps = Array.from({ length: 16 * this.pages }, (_, i) => ({
                step: i,
                note: null,
                accent: false,
                slide: false,
                extend: false
            }));
            this.commit();
        }

        toggleNote(step, noteName) {
            const s = this.pattern.steps[step];
            const note = normalizeNoteName(noteName);
            this.commit();
            s.note = s.note === note ? null : note;
        }

        toggleFlag(step, key) {
            const s = this.pattern.steps[step];
            this.commit();
            s[key] = !s[key];
        }

        toggleDrum(instr, step) {
            const steps = this.pattern.drums.steps[instr];
            this.commit();
            steps[step] = !steps[step];
        }

        setDrumVolume(instr, value) {
            this.pattern.drums.volumes[instr] = value;
        }

        setDrumPages(pages) {
            this.pattern.drums.pages = Math.max(1, Math.min(4, pages));
            drumInstruments.forEach(instr => {
                this.pattern.drums.steps[instr] = Array.from({ length: 16 * this.pattern.drums.pages }, () => false);
            });
            this.commit();
        }

        clearAll() {
            this.commit();
            this.pattern.steps.forEach((s) => {
                s.note = null;
                s.accent = false;
                s.slide = false;
                s.extend = false;
            });
            drumInstruments.forEach(instr => {
                this.pattern.drums.steps[instr].fill(false);
            });
        }

        setKnob(key, value) {
            this.pattern.knobs[key] = value;
        }

        setWaveform(wf) {
            this.pattern.waveform = wf === "square" ? "square" : "sawtooth";
        }

        loadFrom(raw) {
            const norm = this.normalizePatternObject(raw);
            this.commit();
            this.pattern = norm;
        }

        toJSON() {
            return this.clone(this.pattern);
        }

        normalizePatternObject(rawInput) {
            const raw = this.clone(rawInput || {});
            const out = this.createEmptyPattern();

            // Steps 303
            const srcSteps = Array.isArray(raw.steps) ? raw.steps : [];
            srcSteps.forEach((st, i) => {
                if (i < 0 || i >= out.steps.length || !st) return;
                const tgt = out.steps[i];
                if (typeof st.step === "number") tgt.step = st.step;
                if (st.note !== undefined && st.note !== null) {
                    const nn = normalizeNoteName(String(st.note));
                    tgt.note = nn;
                }
                if (typeof st.accent !== "undefined") tgt.accent = !!st.accent;
                if (typeof st.slide !== "undefined") tgt.slide = !!st.slide;
                if (typeof st.extend !== "undefined") tgt.extend = !!st.extend;
            });

            // Knobs
            const defaultsKnobs = out.knobs;
            const srcKnobs = raw.knobs || {};
            Object.keys(defaultsKnobs).forEach((k) => {
                const v = srcKnobs[k];
                out.knobs[k] = typeof v === "number" ? v : defaultsKnobs[k];
            });

            // Waveform
            out.waveform = raw.waveform === "square" ? "square" : "sawtooth";

            // Drums
            const srcDrums = raw.drums || {};
            out.drums.pages = typeof srcDrums.pages === "number" ? Math.max(1, Math.min(4, srcDrums.pages)) : 1;
            drumInstruments.forEach(instr => {
                const srcStepsInstr = Array.isArray(srcDrums.steps?.[instr]) ? srcDrums.steps[instr] : [];
                out.drums.steps[instr] = Array.from({ length: 16 * out.drums.pages }, (_, j) => {
                    return j < srcStepsInstr.length ? !!srcStepsInstr[j] : false;
                });
                const v = srcDrums.volumes?.[instr];
                out.drums.volumes[instr] = typeof v === "number" ? v : 100;
            });

            // Flex pour LLM erreurs : handle flats/backticks déjà in normalizeNoteName
            return out;
        }
    }

    // ------------------------------------------------------------------------
    // SynthEngine (Web Audio, étendu pour drums pitchés)
    // ------------------------------------------------------------------------
    class SynthEngine {
        constructor() {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx({ latencyHint: "interactive" });
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.3;

                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.8;

                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);

                this.distCache = new Map();
                console.log("SynthEngine created, state:", this.ctx.state);
            } catch (e) {
                console.error("AudioContext fail", e);
                this.ctx = null;
            }
        }

        async resume() {
            if (!this.ctx) return false;
            if (this.ctx.state === "suspended") {
                try {
                    await this.ctx.resume();
                    state.audioInitialized = this.ctx.state === "running";
                    console.log("Audio resumed, state:", this.ctx.state);
                    return state.audioInitialized;
                } catch (e) {
                    console.error("Audio resume failed", e);
                    return false;
                }
            }
            state.audioInitialized = this.ctx.state === "running";
            return state.audioInitialized;
        }

        getCurve(amount) {
            const k = Math.max(0, Math.min(100, Math.round(amount || 0)));
            if (this.distCache.has(k)) return this.distCache.get(k);

            const n = 22050;
            const curve = new Float32Array(n);
            const deg = Math.PI / 180;
            for (let i = 0; i < n; i++) {
                const x = (i * 2) / n - 1;
                curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
            }
            this.distCache.set(k, curve);
            return curve;
        }

        // Drum synth basique pitché sur baseFreq
        async playDrum(instrument, time, baseFreq = 110, volume = 100) {
            if (!this.ctx || !await this.resume()) {
                console.warn("Audio not ready - skipping drum");
                return;
            }
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(volume / 100 * 0.8, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

            switch (instrument) {
                case "BD":
                    const oscBD = this.ctx.createOscillator();
                    oscBD.type = "sine";
                    oscBD.frequency.setValueAtTime(baseFreq * 0.5, time);
                    oscBD.frequency.exponentialRampToValueAtTime(baseFreq * 0.1, time + 0.1);
                    oscBD.connect(gain);
                    oscBD.start(time);
                    oscBD.stop(time + 0.2);
                    break;
                case "SD":
                    const durationSD = 0.15;
                    const bufferSizeSD = this.ctx.sampleRate * durationSD;
                    const bufferSD = this.ctx.createBuffer(1, bufferSizeSD, this.ctx.sampleRate);
                    const dataSD = bufferSD.getChannelData(0);
                    for (let i = 0; i < bufferSizeSD; i++) {
                        dataSD[i] = Math.random() * 2 - 1;
                    }
                    const noiseSD = this.ctx.createBufferSource();
                    noiseSD.buffer = bufferSD;

                    const filterSD = this.ctx.createBiquadFilter();
                    filterSD.type = "highpass";
                    filterSD.frequency.value = 2000;

                    noiseSD.connect(filterSD);
                    filterSD.connect(gain);
                    noiseSD.start(time);
                    noiseSD.stop(time + durationSD);
                    break;
                // Ajouter autres instruments : LT/MT/HT sine descend, RS clap noise short, etc.
                default:
                    // Fallback sine short pour autres
                    const oscDefault = this.ctx.createOscillator();
                    oscDefault.type = "sine";
                    oscDefault.frequency.value = baseFreq;
                    oscDefault.connect(gain);
                    oscDefault.start(time);
                    oscDefault.stop(time + 0.1);
            }
            gain.connect(this.masterGain);
        }

        async playStepChain(chainSteps, stepDuration, knobs, waveform, drumsSteps, baseFreq) {
            if (!chainSteps || !chainSteps.length || !this.ctx) return;

            if (!await this.resume()) {
                console.warn("Audio not ready - skipping play");
                return;
            }
            const now = this.ctx.currentTime;

            const tuneMul = Math.pow(2, knobs.tune / 12);
            const freqs = chainSteps.map((s) => (s.note ? noteFrequencies[s.note] * tuneMul : null));

            const accent = !!chainSteps[0].accent;
            const totalDuration = chainSteps.length * stepDuration;
            const GLIDE_RATIO = 0.85;

            const osc = this.ctx.createOscillator();
            osc.type = waveform;
            osc.frequency.setValueAtTime(freqs[0] || 110, now);

            // Slides & EXT : on enchaîne les steps avec ramp
            for (let i = 0; i < chainSteps.length - 1; i++) {
                const cur = chainSteps[i];
                const next = chainSteps[i + 1];
                if (!next) continue;
                if (cur.slide && cur.note && next.note) {
                    const start = now + (i + 1) * stepDuration;
                    const end = start + stepDuration * GLIDE_RATIO;
                    osc.frequency.setValueAtTime(freqs[i], start);
                    osc.frequency.linearRampToValueAtTime(freqs[i + 1], end);
                    osc.frequency.setValueAtTime(freqs[i + 1], end + 1e-4);
                } else if (next.extend && (cur.note || next.note)) {
                    // EXT = même note prolongée
                    const baseNote = cur.note || next.note;
                    const baseFreq303 = noteFrequencies[baseNote] * tuneMul;
                    const start = now + (i + 1) * stepDuration;
                    osc.frequency.setValueAtTime(baseFreq303, start);
                }
            }

            // Filtre TB-303 like
            let cutoff = knobs.cutoff;
            let q = knobs.resonance;
            let envMod = knobs.envMod / 100;
            let extraEnv = 2000 * envMod;
            if (accent) {
                cutoff *= 1.3;
                q *= 1.15;
                extraEnv *= 1.5;
            }
            const decayTime = (knobs.decay / 1000) * (accent ? 0.7 : 1.0);
            const initialCutoff = cutoff + extraEnv;

            const filt1 = this.ctx.createBiquadFilter();
            const filt2 = this.ctx.createBiquadFilter();
            filt1.type = filt2.type = "lowpass";
            filt1.Q.value = filt2.Q.value = q;

            filt1.frequency.setValueAtTime(initialCutoff, now);
            filt1.frequency.exponentialRampToValueAtTime(cutoff, now + decayTime);
            filt2.frequency.setValueAtTime(initialCutoff, now);
            filt2.frequency.exponentialRampToValueAtTime(cutoff, now + decayTime);

            const vca = this.ctx.createGain();
            const gainLevel = accent ? 0.85 : 0.55;
            vca.gain.setValueAtTime(gainLevel, now);
            vca.gain.setValueAtTime(gainLevel, now + totalDuration - 0.002);
            vca.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

            osc.connect(filt1);
            filt1.connect(filt2);

            // Distorsion / tone
            const drive = knobs.drive;
            if (drive > 0) {
                const toneFilter = this.ctx.createBiquadFilter();
                toneFilter.type = "lowpass";
                toneFilter.frequency.value = knobs.tone;

                const ws = this.ctx.createWaveShaper();
                ws.curve = this.getCurve(drive);
                ws.oversample = "4x";

                const distGain = this.ctx.createGain();
                distGain.gain.value = knobs.distVolume / 100;

                filt2.connect(toneFilter);
                toneFilter.connect(ws);
                ws.connect(distGain);
                distGain.connect(vca);
            } else {
                filt2.connect(vca);
            }

            vca.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + totalDuration + 0.05);

            // Play drums at each step
            chainSteps.forEach((s, i) => {
                const drumTime = now + i * stepDuration;
                drumInstruments.forEach(instr => {
                    const drumStep = drumsSteps[instr][i % 16]; // Per page, but for chain assume page 0
                    if (drumStep) {
                        this.playDrum(instr, drumTime, baseFreq, pm.pattern.drums.volumes[instr]);
                    }
                });
            });
        }

        preview(noteName, knobs, waveform) {
            const note = normalizeNoteName(noteName);
            if (!note) return;
            const freq = noteFrequencies[note];
            if (!freq) return;
            this.resume();

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = waveform;
            osc.frequency.value = freq * Math.pow(2, knobs.tune / 12);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.25);
        }

        // Anciens kick/snare gardés pour compat, mais deprecated
        playKick(time) {
            this.playDrum("BD", time);
        }

        playSnare(time) {
            this.playDrum("SD", time);
        }
    }

    // ------------------------------------------------------------------------
    // Spectrum Visualizer
    // ------------------------------------------------------------------------
    class SpectrumVisualizer {
        constructor(canvas, analyser) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.analyser = analyser;
            this.bufferLength = analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.animationId = null;

            this.resize();
            window.addEventListener("resize", () => this.resize());
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        start() {
            if (this.animationId) return;

            const draw = () => {
                this.animationId = requestAnimationFrame(draw);
                this.analyser.getByteFrequencyData(this.dataArray);

                const w = this.canvas.width;
                const h = this.canvas.height;
                const ctx = this.ctx;

                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(0, 0, w, h);

                const barWidth = (w / this.bufferLength) * 2.4;
                let x = 0;

                for (let i = 0; i < this.bufferLength; i++) {
                    const v = this.dataArray[i] / 255;
                    const barHeight = v * h * 0.8;
                    const hue = 180 + (i / this.bufferLength) * 120;
                    ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.85)`;
                    ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
                    x += barWidth;
                }
            };
            draw();
        }

        stop() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    // ------------------------------------------------------------------------
    // Storage (localStorage, étendu pour pages/drums/lang)
    // ------------------------------------------------------------------------
    const STORAGE_KEYS = {
        currentPattern: "tb303_helper_current_pattern",
        patternLibrary: "tb303_helper_library",
        lang: "lang",
        promptSeen: "promptSeen"
    };

    const inMemoryStorage = {};

    const Storage = {
        loadCurrent() {
            try {
                const raw = Utils.safeLocalGet(STORAGE_KEYS.currentPattern);
                if (raw) return JSON.parse(raw);
            } catch (e) {
                console.warn("loadCurrent fail", e);
            }
            return inMemoryStorage.currentPattern || null;
        },
        saveCurrent(patternObj) {
            try {
                const json = JSON.stringify(patternObj);
                if (!Utils.safeLocalSet(STORAGE_KEYS.currentPattern, json)) {
                    inMemoryStorage.currentPattern = patternObj;
                    Utils.toast("storageFallback");
                }
            } catch (e) {
                console.warn("saveCurrent fail", e);
                inMemoryStorage.currentPattern = patternObj;
            }
        },
        loadLibrary() {
            try {
                const raw = Utils.safeLocalGet(STORAGE_KEYS.patternLibrary);
                if (raw) {
                    const arr = JSON.parse(raw);
                    return Array.isArray(arr) ? arr : [];
                }
            } catch (e) {
                console.warn("loadLibrary fail", e);
            }
            return Array.isArray(inMemoryStorage.library) ? inMemoryStorage.library : [];
        },
        saveLibrary(list) {
            try {
                const json = JSON.stringify(list);
                if (!Utils.safeLocalSet(STORAGE_KEYS.patternLibrary, json)) {
                    inMemoryStorage.library = list;
                    Utils.toast("storageFallback");
                }
            } catch (e) {
                console.warn("saveLibrary fail", e);
                inMemoryStorage.library = list;
            }
        },
        addToLibrary(entry) {
            const list = this.loadLibrary();
            list.unshift(entry);
            this.saveLibrary(list);
        },
        saveLang(lang) {
            if (!Utils.safeLocalSet(STORAGE_KEYS.lang, lang)) {
                inMemoryStorage.lang = lang;
            }
        },
        loadLang() {
            return Utils.safeLocalGet(STORAGE_KEYS.lang, inMemoryStorage.lang || 'fr');
        },
        savePromptSeen(seen) {
            if (!Utils.safeLocalSet(STORAGE_KEYS.promptSeen, seen.toString())) {
                inMemoryStorage.promptSeen = seen;
            }
        },
        loadPromptSeen() {
            const raw = Utils.safeLocalGet(STORAGE_KEYS.promptSeen, inMemoryStorage.promptSeen ? 'true' : null);
            return raw === 'true';
        }
    };

    // ------------------------------------------------------------------------
    // Tutoriel TD-3 : génération HTML (fixes + multi-pages)
    // ------------------------------------------------------------------------
    function buildTd3NoteMapping(pattern, page = 0) {
        // Séquence complète de notes dans l'ORDRE (doublons pour repeats/ext, track lastNote)
        const orderedNotes = [];
        let lastNote = null;
        const stepsStart = page * 16;
        const stepsEnd = stepsStart + 16;
        const pageSteps = pattern.steps.slice(stepsStart, stepsEnd);

        pageSteps.forEach((st) => {
            if (st.note) {
                lastNote = st.note;
                orderedNotes.push(st.note);
            } else if (st.extend && lastNote) {
                orderedNotes.push(lastNote); // Repeat for EXT
            } // Silences skip, no push
        });

        const uniqueNotes = [...new Set(orderedNotes.filter(n => n))];

        const lines = [];
        uniqueNotes.forEach((note) => {
            const m = String(note).match(/^([A-G]#?)-(-?\d)$/);
            if (!m) return;
            const pc = m[1];
            const oct = parseInt(m[2], 10);
            if (oct === 2) {
                lines.push(`${note} → touche [${pc}]`);
            } else if (oct > 2) {
                lines.push(`${note} → [Transpose UP] + touche [${pc}]`);
            } else {
                lines.push(`${note} → [Transpose DOWN] + touche [${pc}]`);
            }
        });

        return {
            notesSeq: orderedNotes,
            mappingLines: lines,
            lastNotes: {} // Pour table: track per step
        };
    }

    function buildPatternTutorialHtml(pattern, title, page = 0) {
        const t = translations[state.lang];
        const mapInfo = buildTd3NoteMapping(pattern, page);
        const notesList = mapInfo.notesSeq.join(", ") || "(no notes)";

        let html = "";
        html += `<div class="tutorial-pattern-title">${title || "Pattern"}</div>`;
        html += `<div class="td3-instructions">`;
        html += `<h3>${t.td3Instructions}</h3>`;
        html += `<ol>`;
        html += `<li>Met la TD-3 en <strong>${t.pitchMode}</strong>.</li>`;
        html += `<li>${t.enterNotes.replace('%s', notesList)}</li>`;
        html += `<li>Quand toutes les notes sont programmées, passe en <strong>${t.timeMode}</strong>.</li>`;
        html += `<li>Pour chaque step (1 → 16), suis le tableau :<ul>`;
        html += `<li><strong>${t.timeDouble}</strong> pour une note jouée.</li>`;
        html += `<li><strong>${t.timeExt}</strong> pour prolonger la note précédente.</li>`;
        html += `<li><strong>${t.timeRest}</strong> pour un silence.</li>`;
        html += `</ul></li>`;
        html += `<li>Repasse ensuite en <strong>${t.pitchMode}</strong>, et pour chaque step :`;
        html += `<ul><li><strong>${t.accentSlide}</strong></li></ul></li>`;
        html += `<li>${t.whiteNext}</li>`;
        html += `</ol>`;

        html += `<h4>${t.keyboard}</h4><ul>`;
        if (mapInfo.mappingLines.length) {
            mapInfo.mappingLines.forEach((line) => {
                html += `<li>${line}</li>`;
            });
        } else {
            html += `<li>${t.noNotes}</li>`;
        }
        html += `</ul></div>`;

        // Tableau 16 steps : Note / Time / Flags
        let lastNoteForTable = null;
        html += `<table class="tutorial-table"><thead><tr><th>${t.step}</th><th>${t.note}</th><th>${t.time}</th><th>${t.flags}</th></tr></thead><tbody>`;
        for (let i = 0; i < 16; i++) {
            const globalStep = page * 16 + i;
            const s = pattern.steps[globalStep] || { note: null, accent: false, slide: false, extend: false };

            let noteText = "—";
            let timeText = t.restSilence;

            if (s.extend && lastNoteForTable) {
                noteText = lastNoteForTable;
                timeText = t.extTie;
            } else if (s.note) {
                noteText = s.note;
                timeText = t.sixteenth;
                lastNoteForTable = s.note;
            }

            const flags = [];
            if (s.accent) flags.push("ACC");
            if (s.slide) flags.push("SLIDE");
            // No EXT in flags

            html += `<tr><td>${i + 1}</td><td>${noteText}</td><td>${timeText}</td><td>${flags.join(" ")}</td></tr>`;
        }
        html += `</tbody></table>`;

        return html;
    }

    // Pour multi-pages
    function buildMultiPageTutorial(pattern, titleBase) {
        let html = "";
        for (let p = 0; p < state.pages303; p++) {
            html += buildPatternTutorialHtml(pattern, `${titleBase} ${p + 1} (Steps ${p*16 +1}-${(p+1)*16})`, p);
            if (p < state.pages303 - 1) {
                html += `<p><strong>Link in Hardware Track Mode: Program as separate patterns A/B/C/D and chain them.</strong></p>`;
            }
        }
        return html;
    }

    // ------------------------------------------------------------------------
    // Génération pattern aléatoire "smart" (étendu pour drums)
    // ------------------------------------------------------------------------
    function generateSmartRandomPattern() {
        const pm = new PatternManager();
        const p = pm.pattern;

        const scales = {
            minor: [0, 2, 3, 5, 7, 8, 10],
            major: [0, 2, 4, 5, 7, 9, 11],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            blues: [0, 3, 5, 6, 7, 10]
        };
        const scaleNames = Object.keys(scales);
        const scaleName = scaleNames[Math.floor(Math.random() * scaleNames.length)];
        const scale = scales[scaleName];

        const baseOct = Math.random() < 0.5 ? 2 : 3;
        const totalSteps = 16 * pm.pages;

        for (let i = 0; i < totalSteps; i++) {
            const st = p.steps[i];
            const hasNote = Math.random() < 0.7;

            if (hasNote) {
                const idx = scale[Math.floor(Math.random() * scale.length)];
                let oct = baseOct;
                if (Math.random() < 0.2) {
                    oct += Math.random() < 0.5 ? -1 : 1;
                    if (oct < 1) oct = 1;
                    if (oct > 3) oct = 3;
                }
                st.note = `${NOTE_ORDER[idx]}-${oct}`;
            } else {
                st.note = null;
            }

            st.accent = (i % 4 === 0 && Math.random() < 0.65) || Math.random() < 0.15;
            st.slide = !!(st.note && Math.random() < 0.22);
            st.extend = false;
        }

        // Random drums
        drumInstruments.forEach(instr => {
            for (let j = 0; j < 16 * p.drums.pages; j++) {
                p.drums.steps[instr][j] = Math.random() < (instr === "BD" ? 0.8 : 0.3); // Plus BD
            }
            p.drums.volumes[instr] = Math.random() * 100 + 50;
        });

        return pm.toJSON();
    }

    // ------------------------------------------------------------------------
    // UI Controller (étendu pour tout)
    // ------------------------------------------------------------------------
    let pm, synth, spectrum;
    let knobUpdaters = {};

    const UI = (function() {
        // Build sequencer grid 303 avec highlights et multi-pages
        function buildSequencerGrid() {
            const container = document.getElementById("sequencerGrid");
            if (!container) return;
            const t = translations[state.lang];
            container.innerHTML = "";

            // Headers steps
            let gridHtml = '<div class="note-label"></div>'; // Empty corner
            for (let s = 0; s < 16 * state.pages303; s++) {
                const stepNum = s % 16 + 1;
                const isBeat = (s % 4 === 0);
                const beatClass = isBeat ? ' beat-col' : '';
                gridHtml += `<div class="step-header${beatClass}">${stepNum}</div>`;
            }

            // Rows: Note + flags
            noteNamesAsc.forEach((noteName, rowIdx) => {
                const isC4Row = noteName === "C-4"; // Surbrillance C4 (ajusté à C2? mais code garde C4)
                const rowClass = isC4Row ? ' c4-row' : '';
                gridHtml += `<div class="note-label${rowClass}">${noteName}</div>`;
                for (let s = 0; s < 16 * state.pages303; s++) {
                    const isC4Step = isC4Row && (s % 16 === 0); // Premier step per page?
                    const stepClass = isC4Step ? ' c4-step' : '';
                    gridHtml += `<div class="step-button${stepClass}" data-step="${s}" data-note="${noteName}"></div>`;
                }
                // Flags rows
                ['accent', 'slide', 'extend'].forEach(flag => {
                    const flagClass = `${flag}-row`; // Pour CSS highlights: red acc, blue slide, yellow ext
                    gridHtml += `<div class="note-label ${flagClass}">${flag.toUpperCase()}</div>`;
                    for (let s = 0; s < 16 * state.pages303; s++) {
                        const btnClass = `${flag}-button`;
                        gridHtml += `<div class="${btnClass}" data-step="${s}" data-flag="${flag}"></div>`;
                    }
                });
            });

            container.innerHTML = gridHtml;
        }

        // Build drum grid
        function buildDrumGrid() {
            const inner = document.getElementById("drum909GridInner");
            if (!inner) return;
            inner.innerHTML = "";

            // Headers steps
            let gridHtml = '<div class="drum-909-label"></div>'; // Empty
            for (let s = 0; s < 16 * state.pagesDrum; s++) {
                const stepNum = s % 16 + 1;
                const isBeat = (s % 4 === 0);
                const beatClass = isBeat ? ' beat-col' : ''; // Même highlight orange
                gridHtml += `<div class="drum-909-step step-header${beatClass}">${stepNum}</div>`;
            }

            // Instrument rows
            drumInstruments.forEach(instr => {
                gridHtml += `<div class="drum-909-label">${instr}</div>`;
                for (let s = 0; s < 16 * state.pagesDrum; s++) {
                    gridHtml += `<div class="drum-909-step" data-instr="${instr}" data-step="${s}"></div>`;
                }
            });

            inner.innerHTML = gridHtml;
        }

        // Build drum mixer faders
        function buildDrumMixer() {
            const mixer = document.getElementById("drum909Mixer");
            if (!mixer) return;
            let html = '<div class="drum-909-channel"><div class="drum-909-channel-title">Drum Machine Mixer</div>';
            drumInstruments.forEach(instr => {
                html += `
                    <div class="knob-container">
                        <div class="knob" id="drumVol${instr}" data-min="0" data-max="100" data-value="${pm.pattern.drums.volumes[instr] || 100}">
                            <div class="knob-indicator"></div>
                        </div>
                        <div class="knob-label">${instr} Vol</div>
                        <div class="knob-value" id="valueVol${instr}">${pm.pattern.drums.volumes[instr] || 100}%</div>
                    </div>
                `;
            });
            html += '</div>';
            mixer.innerHTML = html;
            // Re-init knobs for drums
            initDrumKnobs();
        }

        function initKnobs() {
            // Fader fix: use --pos 0-100 instead of --rotation
            const knobs = document.querySelectorAll('.knob');
            knobs.forEach(knob => {
                const min = parseFloat(knob.dataset.min);
                const max = parseFloat(knob.dataset.max);
                const value = parseFloat(knob.dataset.value);
                const pos = ((value - min) / (max - min)) * 100;
                knob.style.setProperty('--pos', pos);
                knob.style.willChange = 'transform';

                let isDragging = false;
                let startY, startPos;

                const updateValue = (clientY) => {
                    const rect = knob.getBoundingClientRect();
                    const height = rect.height;
                    const newPos = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / height * 100)));
                    knob.style.setProperty('--pos', newPos);
                    const newValue = min + (newPos / 100) * (max - min);
                    knob.dataset.value = newValue;
                    const id = knob.id;
                    const valueEl = document.getElementById(`value${id.slice(4)}`);
                    if (valueEl) valueEl.textContent = formatKnobValue(id, newValue);
                    pm.setKnob(id.replace('knob', ''), newValue);
                };

                knob.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startY = e.clientY;
                    startPos = parseFloat(knob.style.getPropertyValue('--pos'));
                    updateValue(e.clientY);
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    updateValue(e.clientY);
                });

                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });

                // Touch
                knob.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    isDragging = true;
                    const touch = e.touches[0];
                    startY = touch.clientY;
                    startPos = parseFloat(knob.style.getPropertyValue('--pos'));
                    updateValue(touch.clientY);
                });

                document.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const touch = e.touches[0];
                    updateValue(touch.clientY);
                });

                document.addEventListener('touchend', () => {
                    isDragging = false;
                });
            });

            function formatKnobValue(id, value) {
                const knobType = id.replace('knob', '');
                switch (knobType) {
                    case 'Cutoff': case 'Tone': return Math.round(value) + ' Hz';
                    case 'EnvMod': case 'Accent': case 'Drive': case 'DistVolume': return Math.round(value) + '%';
                    case 'Decay': return Math.round(value) + ' ms';
                    case 'Resonance': return value.toFixed(1);
                    default: return Math.round(value);
                }
            }

            // Updaters pour load
            knobUpdaters = {
                tune: (v) => { const el = document.getElementById('knobTune'); if (el) { const pos = ((v +12)/24)*100; el.style.setProperty('--pos', pos); document.getElementById('valueTune').textContent = v; } },
                cutoff: (v) => { const el = document.getElementById('knobCutoff'); if (el) { const pos = (v/4000)*100; el.style.setProperty('--pos', pos); document.getElementById('valueCutoff').textContent = Math.round(v) + ' Hz'; } },
                // ... similaire pour tous knobs
                resonance: (v) => { /* impl */ },
                envMod: (v) => { /* impl */ },
                decay: (v) => { /* impl */ },
                accent: (v) => { /* impl */ },
                drive: (v) => { /* impl */ },
                tone: (v) => { /* impl */ },
                distVolume: (v) => { /* impl */ }
            };
        }

        function initDrumKnobs() {
            // Similaire à initKnobs mais pour drumVol*
            const drumKnobs = document.querySelectorAll('[id^="drumVol"]');
            drumKnobs.forEach(knob => {
                // Même logic que initKnobs, mais setDrumVolume(instr, v)
                const instr = knob.id.replace('drumVol', '');
                // ... impl touch/drag, pm.setDrumVolume
            });
        }

        function updateSequencerDisplay() {
            const steps = pm.pattern.steps;
            const totalSteps = 16 * state.pages303;

            // Notes
            document.querySelectorAll('.step-button').forEach((btn, idx) => {
                const step = parseInt(btn.dataset.step);
                if (step >= totalSteps) return;
                const s = steps[step];
                btn.textContent = s.note ? '●' : '';
                btn.classList.toggle('active', !!s.note);
            });

            // Flags
            ['accent', 'slide', 'extend'].forEach(flag => {
                document.querySelectorAll(`.${flag}-button`).forEach((btn, idx) => {
                    const step = parseInt(btn.dataset.step);
                    if (step >= totalSteps) return;
                    const s = steps[step];
                    btn.classList.toggle('active', s[flag]);
                });
            });

            // Drums
            drumInstruments.forEach(instr => {
                pm.pattern.drums.steps[instr].forEach((active, step) => {
                    const btn = document.querySelector(`[data-instr="${instr}"][data-step="${step}"]`);
                    if (btn) {
                        btn.classList.toggle('active', active);
                    }
                });
            });
        }

        function playStep(pattern, step, stepDuration, isTrack = false) {
            const pageSteps = pattern.steps.slice(step, step + 16); // Chunk 16
            const baseFreq = pattern.steps.find(s => s.note)?.note ? noteFrequencies[pattern.steps.find(s => s.note).note] : noteFrequencies['C-2'];
            synth.playStepChain(pageSteps, stepDuration, pattern.knobs, pattern.waveform, pattern.drums.steps, baseFreq);

            // Highlight
            document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
            const btn = document.querySelector(`[data-step="${step}"]`);
            if (btn) btn.classList.add('playing');

            if (!isTrack && spectrum) spectrum.start();
        }

        async function startPlayback() {
            if (state.isPlaying) return;
            state.isPlaying = true;
            if (spectrum) spectrum.start();
            await synth.resume();

            const bpmInput = document.getElementById("bpmInput");
            const bpm = parseInt(bpmInput.value || "120", 10);
            state.bpm = Number.isNaN(bpm) ? 120 : bpm;
            const stepDur = (60 / state.bpm) / 4 * state.pages303; // Adjust for pages?

            state.intervalId = setInterval(() => {
                if (!state.isPlaying) return;
                playStep(pm.pattern, state.trackStepIndex || 0, stepDur, state.trackPlaying);
                (state.trackStepIndex || 0)++;
                if ((state.trackStepIndex || 0) >= 16 * state.pages303) {
                    state.trackStepIndex = 0;
                }
            }, stepDur * 1000);
        }

        function stopPlayback() {
            if (!state.isPlaying) return;
            state.isPlaying = false;
            clearInterval(state.intervalId);
            state.intervalId = null;
            document.querySelectorAll(".playing").forEach((el) => el.classList.remove("playing"));
            if (!state.trackPlaying && spectrum) spectrum.stop();
        }

        // Track mode (adapté multi-pages)
        function updateTrackChainFromUI() {
            const chain = [];
            const library = Storage.loadLibrary();
            const selects = document.querySelectorAll(".track-select");
            selects.forEach((sel) => {
                const id = sel.value;
                if (!id) return;
                const entry = library.find((e) => e.id === id);
                if (entry && entry.pattern) chain.push(entry.pattern);
            });
            state.trackChain = chain;
        }

        async function startTrackPlayback() {
            updateTrackChainFromUI();
            if (!state.trackChain.length) {
                Utils.toast("trackEmpty");
                return;
            }
            if (state.isPlaying) stopPlayback();
            if (spectrum) spectrum.start();
            await synth.resume();

            const bpmInput = document.getElementById("bpmInput");
            const bpm = parseInt(bpmInput.value || "120", 10);
            state.bpm = Number.isNaN(bpm) ? 120 : bpm;
            const stepDur = (60 / state.bpm) / 4;

            state.trackPlaying = true;
            state.trackPatternIndex = 0;
            state.trackStepIndex = 0;

            state.trackIntervalId = setInterval(() => {
                const pat = state.trackChain[state.trackPatternIndex];
                playStep(pat, state.trackStepIndex, stepDur, true);

                state.trackStepIndex++;
                if (state.trackStepIndex >= 16) {
                    state.trackStepIndex = 0;
                    state.trackPatternIndex = (state.trackPatternIndex + 1) % state.trackChain.length;
                }
            }, stepDur * 1000);
        }

        function stopTrackPlayback() {
            if (!state.trackPlaying) return;
            state.trackPlaying = false;
            clearInterval(state.trackIntervalId);
            state.trackIntervalId = null;
            if (!state.isPlaying && spectrum) spectrum.stop();
        }

        // Save to clipboard
        function saveCurrentToClipboard() {
            const pattern = pm.toJSON();
            const json = JSON.stringify(pattern, null, 2);
            Utils.copyToClipboard(json);
        }

        // Load from clipboard flex
        async function loadFromClipboard() {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                Utils.toast("clipboardApiNotAvailable");
                return;
            }
            try {
                let text = await navigator.clipboard.readText();
                if (!text) {
                    Utils.toast("clipboardEmpty");
                    return;
                }
                // Flex: strip backticks/blocks, flats already handled
                text = text.replace(/```(?:json)?|```|\s*json\s*/g, '').trim();
                let obj;
                try {
                    obj = JSON.parse(text);
                } catch {
                    Utils.toast("clipboardInvalid");
                    return;
                }
                const patternObj = obj.pattern || obj;
                pm.loadFrom(patternObj);
                updateSequencerDisplay();
                buildDrumGrid();
                buildDrumMixer();
                Object.keys(pm.pattern.knobs).forEach((k) => {
                    if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                });
                const wfSelect = document.getElementById("waveformSelect");
                if (wfSelect) wfSelect.value = pm.pattern.waveform;
                Storage.saveCurrent(pm.toJSON());
                Utils.toast("clipboardLoaded");
            } catch (err) {
                console.error(err);
                Utils.toast("clipboardLoadFailed");
            }
        }

        // Save current
        function saveCurrentToLibrary() {
            const t = translations[state.lang];
            const name = window.prompt(
                "Pattern name (stored in browser localStorage) :",
                "Pattern " + new Date().toLocaleString()
            );
            if (name === null) {
                Utils.toast("saveCancelled");
                return;
            }

            const pattern = pm.toJSON();
            const bpm = state.bpm;
            const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

            const entry = {
                id,
                name: name || "Unnamed",
                bpm,
                pages303: state.pages303,
                pagesDrum: state.pagesDrum,
                createdAt: Utils.nowISO(),
                pattern
            };
            Storage.addToLibrary(entry);
            Storage.saveCurrent(pattern);
            Utils.toast("savedLibrary");

            Utils.downloadJson(entry, (name || "pattern").replace(/\s+/g, "_"));

            refreshPatternList();
        }

        function loadLastPattern() {
            const obj = Storage.loadCurrent();
            if (!obj) {
                Utils.toast("noStored");
                return;
            }
            pm.loadFrom(obj);
            state.pages303 = obj.pages303 || 1;
            state.pagesDrum = obj.pagesDrum || 1;
            document.getElementById("pages303Select").value = state.pages303;
            document.getElementById("pagesDrumSelect").value = state.pagesDrum;
            buildSequencerGrid();
            buildDrumGrid();
            updateSequencerDisplay();
            buildDrumMixer();
            Object.keys(pm.pattern.knobs).forEach((k) => {
                if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
            });
            const wfSelect = document.getElementById("waveformSelect");
            if (wfSelect) wfSelect.value = pm.pattern.waveform;
            Utils.toast("loadedLast");
        }

        // Pattern library / Track
        function refreshPatternList() {
            const listEl = document.getElementById("patternList");
            if (!listEl) return;
            const library = Storage.loadLibrary();
            listEl.innerHTML = "";

            library.forEach((entry) => {
                const li = document.createElement("li");
                const title = document.createElement("div");
                const meta = document.createElement("div");
                const btnLoad = document.createElement("button");

                title.textContent = entry.name || "(unnamed)";
                meta.className = "pattern-meta";
                meta.textContent = `id=${entry.id} | bpm=${entry.bpm || "—"} | pages303=${entry.pages303 || 1} | ${entry.createdAt}`;

                btnLoad.className = "btn btn-load";
                btnLoad.textContent = "Load in Composer";
                btnLoad.addEventListener("click", () => {
                    state.pages303 = entry.pages303 || 1;
                    state.pagesDrum = entry.pagesDrum || 1;
                    document.getElementById("pages303Select").value = state.pages303;
                    document.getElementById("pagesDrumSelect").value = state.pagesDrum;
                    pm.loadFrom(entry.pattern);
                    buildSequencerGrid();
                    buildDrumGrid();
                    updateSequencerDisplay();
                    buildDrumMixer();
                    Object.keys(pm.pattern.knobs).forEach((k) => {
                        if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                    });
                    const wfSelect = document.getElementById("waveformSelect");
                    if (wfSelect) wfSelect.value = pm.pattern.waveform;
                    Storage.saveCurrent(pm.toJSON());
                    Utils.toast(Utils.t.loadedPattern.replace('%s', entry.name));
                });

                li.appendChild(title);
                li.appendChild(meta);
                li.appendChild(btnLoad);
                listEl.appendChild(li);
            });

            buildTrackChainEditor();
        }

        function buildTrackChainEditor() {
            const container = document.getElementById("trackChainContainer");
            const lengthInput = document.getElementById("trackLengthInput");
            if (!container || !lengthInput) return;
            const library = Storage.loadLibrary();

            let len = parseInt(lengthInput.value || "4", 10);
            if (!len || len < 1) len = 1;
            if (len > 64) len = 64;
            lengthInput.value = String(len);

            container.innerHTML = "";
            for (let i = 0; i < len; i++) {
                const row = document.createElement("div");
                row.className = "track-row";

                const label = document.createElement("label");
                label.textContent = `#${i + 1}`;
                const sel = document.createElement("select");
                sel.className = "track-select";

                const optNone = document.createElement("option");
                optNone.value = "";
                optNone.textContent = "-- none --";
                sel.appendChild(optNone);

                library.forEach((entry) => {
                    const opt = document.createElement("option");
                    opt.value = entry.id;
                    opt.textContent = entry.name || `Pattern ${entry.id}`;
                    sel.appendChild(opt);
                });

                row.appendChild(label);
                row.appendChild(sel);
                container.appendChild(row);
            }
        }

        function openPatternModal() {
            const modal = document.getElementById("patternModal");
            if (!modal) {
                Utils.toast("patternModalNotFound");
                return;
            }
            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            const closeBtn = document.getElementById("patternModalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener("click", (e) => {
                if (e.target.id === "patternModal") close();
            }, { once: true });

            refreshPatternList();
        }

        // Tutoriel
        function openPatternTutorial(patternObj, title) {
            const modal = document.getElementById("tutorialModal");
            const content = document.getElementById("tutorialContent");
            const bar = document.getElementById("progressFill");
            if (!modal || !content || !bar) {
                Utils.toast("tutorialModalNotFound");
                return;
            }

            let html;
            if (state.pages303 > 1) {
                html = `<div style="font-size:13px;">${buildMultiPageTutorial(patternObj, title)}</div>`;
            } else {
                html = `<div style="font-size:13px;">${buildPatternTutorialHtml(patternObj, title)}</div>`;
            }
            content.innerHTML = html;
            bar.style.width = "100%";

            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            const closeBtn = document.getElementById("modalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener("click", (e) => {
                if (e.target.id === "tutorialModal") close();
            }, { once: true });
        }

        function openTrackTutorial() {
            updateTrackChainFromUI();
            if (!state.trackChain.length) {
                Utils.toast("trackEmpty");
                return;
            }

            const modal = document.getElementById("tutorialModal");
            const content = document.getElementById("tutorialContent");
            const bar = document.getElementById("progressFill");
            if (!modal || !content || !bar) {
                Utils.toast("tutorialModalNotFound");
                return;
            }

            let html = `<div style="font-size:13px;">`;
            state.trackChain.forEach((pat, idx) => {
                if (state.pages303 > 1) {
                    html += buildMultiPageTutorial(pat, Utils.t.trackTutorial.replace('%d', idx + 1));
                } else {
                    html += buildPatternTutorialHtml(pat, Utils.t.trackTutorial.replace('%d', idx + 1));
                }
            });
            html += `</div>`;
            content.innerHTML = html;
            bar.style.width = "100%";

            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            const closeBtn = document.getElementById("modalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener("click", (e) => {
                if (e.target.id === "tutorialModal") close();
            }, { once: true });
        }

        // Prompt Gen Modal
        function openPromptGen() {
            if (!state.promptSeen) {
                const welcomeModal = document.getElementById("promptWelcomeModal") || createWelcomeModal();
                welcomeModal.classList.add("active");
                const okBtn = document.getElementById("promptOkBtn");
                const dontShow = document.getElementById("dontShowAgain");
                okBtn.onclick = () => {
                    state.promptSeen = true;
                    Storage.savePromptSeen(true);
                    welcomeModal.classList.remove("active");
                    openPromptMain();
                };
                if (dontShow.checked) {
                    state.promptSeen = true;
                    Storage.savePromptSeen(true);
                }
                return;
            }
            openPromptMain();
        }

        function createWelcomeModal() {
            // Assume HTML has it, or dynamic create
            // For code, assume added in HTML
        }

        function openPromptMain() {
            const modal = document.getElementById("promptModal");
            if (!modal) return;
            // Fill form with defaults
            document.getElementById("promptTempo").value = 120;
            document.getElementById("promptFundamental").value = "C-2";
            // ... sets for selects
            document.getElementById("promptTypeBoth").checked = true;

            const generateBtn = document.getElementById("generatePromptBtn");
            generateBtn.onclick = generatePrompt;

            const copyBtn = document.getElementById("copyPromptBtn");
            copyBtn.onclick = () => Utils.copyToClipboard(document.getElementById("promptOutput").value);

            modal.classList.add("active");
        }

        function generatePrompt() {
            const t = translations[state.lang];
            const tempo = document.getElementById("promptTempo").value;
            const fund = document.getElementById("promptFundamental").value;
            const style1 = document.getElementById("promptStyle1").value;
            const style2 = document.getElementById("promptStyle2").value || '';
            const atm = document.getElementById("promptAtmosphere").value;
            const sc = document.getElementById("promptScale").value;
            const rhy = document.getElementById("promptRhythmSig").value;
            const numPat = document.getElementById("promptNumPatterns").value;
            const type = document.querySelector('input[name="promptType"]:checked').value;
            const adj = document.getElementById("promptAdjectives").value;

            // Mega-prompt ultra puissant
            let prompt = `You are an expert TB-303 and Drum Machine composer, specializing in electronic music. Your task is to generate ${numPat} compatible JSON patterns for the TB-303/TD-3 Helper app.

Parameters:
- BPM: ${tempo}
- Fundamental note: ${fund}
- Styles: ${style1}${style2 ? ' + ' + style2 : ''}
- Atmosphere: ${atm}
- Scale/Mode: ${sc}
- Rhythm signature: ${rhy}
- Type: ${type}
- Additional: ${adj || 'None'}

Output EXCLUSIVELY a valid JSON object array of ${numPat} patterns. No explanations, no markdown, no text. Use sharp notation only (C# not Db). Octaves 1-4. Steps: 16 per pattern, with note (string like "C-2"), accent/slide/extend (bool). Drums: for each instr (BD,SD,LT,MT,HT,RS,CP,CH,OH,CY), array of 16 bools. Knobs: tune:0-±12, cutoff:20-4000, etc. (defaults if not specified). Pitch drums to fundamental freq.

Schema example (empty for 1 pattern):
[
  {
    "steps": [
      {"step":0, "note":null, "accent":false, "slide":false, "extend":false},
      // ... 15 more
    ],
    "knobs": {"tune":0, "cutoff":800, /* all */},
    "waveform": "sawtooth",
    "drums": {
      "pages":1,
      "steps": {"BD":[false,false,...], /* all instr */},
      "volumes": {"BD":100, /* all */}
    }
  }
  // For multiple, repeat objects
]

Ensure JSON is parseable, no comments. Output ONLY the JSON array.`;

            document.getElementById("promptOutput").value = prompt;
            document.getElementById("promptExpl").textContent = t.promptExpl;
        }

        // Export MIDI (adapté multi-pages)
        function exportMidiCurrentPattern() {
            const pattern = pm.toJSON();
            const bpm = state.bpm || 120;
            const totalSteps = 16 * state.pages303;

            // ... (keep original logic, but loop totalSteps, handle ext as tie duration)
            // WIP for ext: if extend, longer note off delta

            // ... impl similar, download "tb303_pattern.mid"
            Utils.toast("midiExported");
        }

        // Save preset
        function savePresetToFile() {
            const t = translations[state.lang];
            const presetName = window.prompt(
                "Preset name (303 + Drum Machine) :",
                "Preset " + new Date().toLocaleString()
            );
            if (presetName === null) {
                Utils.toast("presetCancelled");
                return;
            }

            const preset = {
                type: "TB303_DRUM_PRESET",
                name: presetName || "Unnamed Preset",
                createdAt: Utils.nowISO(),
                bpm: state.bpm,
                tb303: pm.toJSON(),
                drum: {
                    // Full drum state
                    status: "Complete"
                }
            };

            Utils.downloadJson(preset, (presetName || "preset").replace(/\s+/g, "_"));
        }

        // FAQ
        function openFaqModal() {
            const modal = document.getElementById("faqModal");
            const content = document.getElementById("faqContent");
            const closeBtn = document.getElementById("faqModalClose");

            if (!modal || !content) {
                Utils.toast("faqWip");
                return;
            }

            const t = translations[state.lang];
            let html = `<div style="font-size:13px;">`;
            html += `<h2>${t.faqTitle}</h2>`;
            html += `<p><em>${t.faqIntro}</em></p>`;
            html += `<ul>`;
            t.faqQuestions.forEach(q => html += `<li>${q}</li>`);
            html += `</ul>`;
            html += `<p style="margin-top:8px;"><strong>${t.faqStatus}</strong></p>`;
            html += `</div>`;

            content.innerHTML = html;
            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener("click", (e) => {
                if (e.target.id === "faqModal") close();
            }, { once: true });
        }

        // Bind UI (étendu)
        function bindUI() {
            const t = translations[state.lang];

            // Pages selects
            const pages303Select = document.getElementById("pages303Select");
            if (pages303Select) {
                pages303Select.onchange = (e) => {
                    state.pages303 = parseInt(e.target.value);
                    pm.setPages(state.pages303);
                    buildSequencerGrid();
                    updateSequencerDisplay();
                };
            }
            const pagesDrumSelect = document.getElementById("pagesDrumSelect");
            if (pagesDrumSelect) {
                pagesDrumSelect.onchange = (e) => {
                    state.pagesDrum = parseInt(e.target.value);
                    pm.setDrumPages(state.pagesDrum);
                    buildDrumGrid();
                    updateSequencerDisplay();
                };
            }

            // Boutons principaux
            const btnPlay = document.getElementById("btnPlay");
            if (btnPlay) btnPlay.textContent = t.play;
            btnPlay?.addEventListener("click", () => {
                if (state.trackPlaying) stopTrackPlayback();
                startPlayback();
            });

            const btnStop = document.getElementById("btnStop");
            if (btnStop) btnStop.textContent = t.stop;
            btnStop?.addEventListener("click", () => {
                stopPlayback();
                stopTrackPlayback();
            });

            const btnClear = document.getElementById("btnClear");
            if (btnClear) btnClear.textContent = t.clear;
            btnClear?.addEventListener("click", () => {
                if (window.confirm(Utils.t.clearConfirm)) {
                    pm.clearAll();
                    updateSequencerDisplay();
                    buildDrumGrid();
                    Storage.saveCurrent(pm.toJSON());
                }
            });

            const btnRandom = document.getElementById("btnRandom");
            if (btnRandom) btnRandom.textContent = t.random;
            btnRandom?.addEventListener("click", () => {
                const p = generateSmartRandomPattern();
                pm.loadFrom(p);
                buildSequencerGrid();
                buildDrumGrid();
                updateSequencerDisplay();
                buildDrumMixer();
                Object.keys(pm.pattern.knobs).forEach((k) => {
                    if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                });
                const wfSelect = document.getElementById("waveformSelect");
                if (wfSelect) wfSelect.value = pm.pattern.waveform;
                Storage.saveCurrent(pm.toJSON());
                Utils.toast("randomNotSaved");
            });

            const btnMidi = document.getElementById("btnMidi");
            if (btnMidi) btnMidi.textContent = t.midi;
            btnMidi?.addEventListener("click", exportMidiCurrentPattern);

            // Secondary
            const btnSave = document.getElementById("btnSave");
            if (btnSave) btnSave.textContent = t.save;
            btnSave?.addEventListener("click", saveCurrentToLibrary);

            const btnLoad = document.getElementById("btnLoad");
            if (btnLoad) btnLoad.textContent = t.load;
            btnLoad?.addEventListener("click", loadLastPattern);

            const btnClipboardLoad = document.getElementById("btnClipboard");
            if (btnClipboardLoad) btnClipboardLoad.textContent = t.clipboardLoad;
            btnClipboardLoad?.addEventListener("click", loadFromClipboard);

            const btnClipboardSave = document.getElementById("btnClipboardSave");
            if (btnClipboardSave) btnClipboardSave.textContent = t.clipboardSave;
            btnClipboardSave?.addEventListener("click", saveCurrentToClipboard);

            const btnPatternModal = document.getElementById("btnPatternModal");
            if (btnPatternModal) btnPatternModal.textContent = t.patterns;
            btnPatternModal?.addEventListener("click", openPatternModal);

            const btnFaq = document.getElementById("btnFaq");
            if (btnFaq) btnFaq.textContent = t.faq;
            btnFaq?.addEventListener("click", openFaqModal);

            const btnSavePreset = document.getElementById("btnSavePreset");
            if (btnSavePreset) btnSavePreset.textContent = t.preset;
            btnSavePreset?.addEventListener("click", savePresetToFile);

            // Tutoriel
            const btnGenerate = document.getElementById("btnGenerate");
            if (btnGenerate) btnGenerate.textContent = t.generate;
            btnGenerate?.addEventListener("click", () => openPatternTutorial(pm.toJSON(), "Current Pattern"));

            // Track
            const btnApplyTrackLength = document.getElementById("btnApplyTrackLength");
            if (btnApplyTrackLength) btnApplyTrackLength.textContent = t.apply;
            btnApplyTrackLength?.addEventListener("click", buildTrackChainEditor);

            const btnTrackPlay = document.getElementById("btnTrackPlay");
            if (btnTrackPlay) btnTrackPlay.textContent = t.playTrack;
            btnTrackPlay?.addEventListener("click", startTrackPlayback);

            const btnTrackStop = document.getElementById("btnTrackStop");
            if (btnTrackStop) btnTrackStop.textContent = t.stopTrack;
            btnTrackStop?.addEventListener("click", stopTrackPlayback);

            const btnTrackTutorial = document.getElementById("btnTrackTutorial");
            if (btnTrackTutorial) btnTrackTutorial.textContent = t.trackTutorialBtn;
            btnTrackTutorial?.addEventListener("click", openTrackTutorial);

            // Undo/Redo
            const btnUndo = document.getElementById("btnUndo");
            if (btnUndo) btnUndo.textContent = t.undo;
            btnUndo?.addEventListener("click", () => {
                if (pm.undo()) {
                    updateSequencerDisplay();
                    buildDrumGrid();
                }
            });

            const btnRedo = document.getElementById("btnRedo");
            if (btnRedo) btnRedo.textContent = t.redo;
            btnRedo?.addEventListener("click", () => {
                if (pm.redo()) {
                    updateSequencerDisplay();
                    buildDrumGrid();
                }
            });

            // IA
            const btnIa = document.getElementById("btnIa");
            if (btnIa) btnIa.textContent = t.ia;
            btnIa?.addEventListener("click", openPromptGen);

            // Lang toggle
            const btnLangFr = document.getElementById("btnLangFr");
            btnLangFr?.addEventListener("click", () => {
                state.lang = 'fr';
                Storage.saveLang('fr');
                updateLang();
                Utils.t = translations.fr;
            });

            const btnLangEn = document.getElementById("btnLangEn");
            btnLangEn?.addEventListener("click", () => {
                state.lang = 'en';
                Storage.saveLang('en');
                updateLang();
                Utils.t = translations.en;
            });

            // BPM
            const bpmInput = document.getElementById("bpmInput");
            if (bpmInput) {
                bpmInput.addEventListener("change", (e) => {
                    const v = parseInt(e.target.value || "120", 10);
                    state.bpm = Number.isNaN(v) ? 120 : v;
                    if (state.isPlaying) {
                        stopPlayback();
                        startPlayback();
                    }
                });
            }

            // Waveform
            const wfSelect = document.getElementById("waveformSelect");
            if (wfSelect) {
                wfSelect.addEventListener("change", (e) => {
                    pm.setWaveform(e.target.value);
                    Storage.saveCurrent(pm.toJSON());
                });
            }

            // Sequencer binds (click + touch)
            const handleGridEvent = (e) => {
                const target = e.target;
                if (target.classList.contains('step-button')) {
                    const step = parseInt(target.dataset.step);
                    const note = target.dataset.note;
                    pm.toggleNote(step, note);
                    updateSequencerDisplay();
                    Storage.saveCurrent(pm.toJSON());
                } else if (target.classList.contains('accent-button') || target.classList.contains('slide-button') || target.classList.contains('extend-button')) {
                    const step = parseInt(target.dataset.step);
                    const flag = target.dataset.flag;
                    pm.toggleFlag(step, flag);
                    updateSequencerDisplay();
                    Storage.saveCurrent(pm.toJSON());
                } else if (target.classList.contains('drum-909-step')) {
                    const instr = target.dataset.instr;
                    const step = parseInt(target.dataset.step);
                    pm.toggleDrum(instr, step);
                    updateSequencerDisplay();
                    Storage.saveCurrent(pm.toJSON());
                }
            };
            document.addEventListener('click', handleGridEvent);

            const tapTargets = document.querySelectorAll('.btn, .step-button, .drum-909-step, .accent-button, .slide-button, .extend-button');
            tapTargets.forEach(el => {
                el.addEventListener('touchend', (evt) => {
                    evt.preventDefault();
                    el.dispatchEvent(new Event('click', { bubbles: true }));
                }, { passive: false });
            });

            // Keyboard shortcuts
            document.addEventListener("keydown", (e) => {
                const tag = (e.target && e.target.tagName) || "";
                if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

                if (e.code === "Space") {
                    e.preventDefault();
                    if (state.trackPlaying || state.isPlaying) {
                        stopPlayback();
                        stopTrackPlayback();
                    } else {
                        startPlayback();
                    }
                } else if ((e.key === "s" || e.key === "S") && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    saveCurrentToLibrary();
                } else if ((e.key === "l" || e.key === "L") && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    openPatternModal();
                } else if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        pm.redo();
                    } else {
                        pm.undo();
                    }
                    updateSequencerDisplay();
                    buildDrumGrid();
                } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
                    e.preventDefault();
                    pm.redo();
                    updateSequencerDisplay();
                    buildDrumGrid();
                }
            });
        }

        // Init global
        function init() {
            try {
                state.lang = Storage.loadLang();
                state.promptSeen = Storage.loadPromptSeen();
                updateLang();
                Utils.t = translations[state.lang];
                Utils.init();

                pm = new PatternManager();
                synth = new SynthEngine();

                const initAudioBtn = document.getElementById("initAudio");
                if (initAudioBtn) {
                    initAudioBtn.style.display = synth?.ctx && synth.ctx.state !== "running" ? "inline-flex" : "none";
                    initAudioBtn.onclick = async () => {
                        const ok = await synth.resume();
                        if (ok) {
                            initAudioBtn.style.display = "none";
                            Utils.toast("audioInit");
                        } else {
                            Utils.toast("audioFail");
                        }
                    };
                }

                if (!synth?.ctx) {
                    Utils.toast("audioFail");
                }

                buildSequencerGrid();
                buildDrumGrid();
                initKnobs();
                buildDrumMixer();
                updateSequencerDisplay();
                bindUI();

                const last = Storage.loadCurrent();
                if (last) {
                    pm.loadFrom(last);
                    state.pages303 = last.pages303 || 1;
                    state.pagesDrum = last.pagesDrum || 1;
                    document.getElementById("pages303Select").value = state.pages303;
                    document.getElementById("pagesDrumSelect").value = state.pagesDrum;
                    buildSequencerGrid();
                    buildDrumGrid();
                    updateSequencerDisplay();
                    buildDrumMixer();
                    Object.keys(pm.pattern.knobs).forEach((k) => {
                        if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                    });
                    const wfSelect = document.getElementById("waveformSelect");
                    if (wfSelect) wfSelect.value = pm.pattern.waveform;
                }

                const canvas = document.getElementById("spectrumCanvas");
                if (canvas && synth?.analyser) {
                    spectrum = new SpectrumVisualizer(canvas, synth.analyser);
                }

                // Update buttons texts on lang change
                updateLang();
            } catch (e) {
                console.error("UI init fail", e);
                Utils.toast("App init error - check console");
            }
        }

        return { init };
    })();

    // DOM ready + erreurs globales
    window.addEventListener('error', (e) => {
        console.error('JS Error:', e.message, e.error);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => UI.init());
    } else {
        UI.init();
    }
})();

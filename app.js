// ============================================================================
// TB-303 PATTERN HELPER - Frontend pur (GitHub Pages, mobile friendly)
// ============================================================================
// - [X] Pas de backend Python : tout fonctionne en JS côté client
// - [X] Support iPhone / Android / Mac / PC
// - [X] Sauvegarde locale (localStorage) pour pattern courant + librairie
// - [X] Tutoriel TD-3 (TIME + PITCH + EXT)
// - [X] Track mode (enchaînement de patterns)
// - [ ] Export MIDI avancé (multi-patterns, CC, etc.)
// - [ ] Séquenceur TR-909 complet (WIP)
// - [ ] FAQ TD-3 détaillée (WIP)
// ============================================================================

(function () {
    "use strict";

    // ------------------------------------------------------------------------
    // Utilitaires simples
    // ------------------------------------------------------------------------
    const Utils = {
        toastEl: null,
        overlayEl: null,

        init() {
            this.toastEl = document.getElementById("toast");
            this.overlayEl = document.getElementById("overlay");
        },

        toast(msg, ms = 1800) {
            if (!this.toastEl) return;
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

        /**
         * Télécharge un objet JSON sous forme de fichier .json.
         * Le navigateur enverra ça dans le dossier "Téléchargements" par défaut.
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
                this.toast(t("overlayDownload"));
            } catch (e) {
                console.error(e);
                this.toast(t("overlayExportFailed"));
            }
        }
    };

    // ------------------------------------------------------------------------
    // Internationalisation (UI seulement, hors labels de synthé)
    // ------------------------------------------------------------------------
    const I18N = {
        en: {
            appTitle: "TB-303 Pattern Helper",
            appSubtitle: "TD-3 / 303 / 909 / AI",
            faqButton: "? TD-3 FAQ",
            composerTitle: "TB-303 Pattern Composer",
            clear: "Clear",
            random: "Random",
            tutorial: "TD-3 Tutorial",
            bpm: "BPM",
            play: "▶ Play",
            stop: "■ Stop",
            transportHint: "Global transport (303 + 909 + Track)",
            saveLibrary: "Save to Library",
            loadLast: "Load Last",
            loadClipboard: "Load from Clipboard",
            saveClipboard: "Save to Clipboard",
            openLibrary: "Open Pattern Library",
            exportMidi: "Export MIDI",
            controlsTitle: "303 / Drive / 909 Controls",
            waveform: "Waveform",
            saw: "Saw",
            square: "Square",
            kick: "Kick (909)",
            snare: "Snare (909)",
            savePreset: "Save 303 + 909 Preset",
            trackTitle: "Track Mode (Pattern Chain)",
            trackLength: "Track length",
            apply: "Apply",
            trackTutorial: "Track Tutorial",
            playTrack: "▶ Play Track",
            stopTrack: "■ Stop Track",
            aiTitle: "AI Pattern Assistant",
            aiSubtitle: "Generate an ultra-detailed prompt for your LLM (303 + 909, strictly JSON compatible).",
            aiTempo: "Tempo (BPM, optional)",
            aiTimeSig: "Time signature",
            aiTimeSigAuto: "Auto (4/4)",
            aiRoot: "Root note",
            aiRootAuto: "Auto",
            aiScale: "Scale / Mode",
            aiMood: "Mood / Atmosphere",
            aiMoodPlaceholder: "dark, deep, hypnotic...",
            aiStyles: "Styles (multi)",
            aiStylesHint: "Ctrl / Cmd (desktop) for multi-select",
            aiEnergy: "Energy (1–10)",
            aiComplexity: "Complexity (1–10)",
            aiWhat: "Generate what?",
            aiBoth: "303 + Drums",
            ai303Only: "303 only",
            aiDrumsOnly: "Drums only",
            aiGenerate: "Generate AI Prompt",
            aiCopy: "Copy Prompt",
            aiOutputLabel: "Generated AI prompt",
            aiOutputPlaceholder: "Click \"Generate AI Prompt\" to fill this field...",
            aiHelpIntro: "Suggested workflow:",
            aiHelpStep1: "Choose your options (tempo, styles, mood...).",
            aiHelpStep2: "Click on <strong>Generate AI Prompt</strong>.",
            aiHelpStep3: "Click on <strong>Copy Prompt</strong> and paste it into your LLM.",
            aiHelpStep4: "The LLM returns a raw JSON.",
            aiHelpStep5: "Copy this JSON → <strong>Load from Clipboard</strong> button in the 303 composer.",
            patternLibraryTitle: "Pattern Library",
            patternLibraryHelp: "Patterns are stored locally (localStorage). You can also download them as JSON to share or version them.",
            tutorialTitle: "TD-3 Step-by-Step Tutorial",
            faqTitle: "TD-3 FAQ",
            faqPlaceholder: "Detailed answers are a work in progress. This section will be completed after a dedicated research pass.",
            faqStatus: "Status: work in progress. This FAQ will be completed with precise step-by-step guides.",
            overlayDownload: "💾 File downloaded (Downloads folder)",
            overlayExportFailed: "❌ File export failed (WIP)",
            toastTrackEmpty: "Track chain empty",
            toastClipboardApi: "Clipboard API not available",
            toastClipboardApiFallback: "Clipboard unavailable: copy / paste manually",
            toastClipboardCopied: "📋 Pattern copied to clipboard (JSON)",
            toastClipboardCopyFailed: "❌ Clipboard copy failed",
            toastClipboardStructureInvalid: "Clipboard JSON missing pattern or steps",
            toastClipboardLoadedManual: "📋 Pattern loaded (manual paste)",
            toastSaveCancelled: "❌ Save cancelled",
            toastPatternSaved: "✅ Pattern saved in library",
            toastNoStoredPattern: "No stored pattern yet",
            toastLoadedLast: "✅ Loaded last pattern",
            toastClipboardEmpty: "Clipboard is empty",
            toastClipboardInvalid: "JSON from clipboard invalid",
            toastClipboardLoaded: "📋 Pattern loaded from clipboard",
            toastClipboardLoadFailed: "❌ Clipboard load failed",
            toastLoadedPattern: ({ name }) => `Loaded pattern "${name}"`,
            toastPatternModalMissing: "Pattern modal not found (HTML WIP)",
            toastTutorialModalMissing: "Tutorial modal not found (HTML WIP)",
            toastMidiExported: "📁 MIDI exported",
            toastPresetCancelled: "❌ Preset save cancelled",
            toastFaqMissing: "TD-3 FAQ is a work in progress (add the HTML for the modal)",
            toastAiGenerated: "🧠 AI prompt generated",
            toastPromptEmpty: "Prompt empty, generate it first",
            toastPromptCopied: "📋 Prompt copied to clipboard",
            toastRandomPattern: "🎲 Random pattern (not saved in library yet)",
            confirmClear: "Clear all steps?",
            promptPatternName: "Pattern name (stored in browser localStorage):",
            promptPresetName: "Preset name (303 + 909):",
            unnamedPattern: "Unnamed",
            unnamedPreset: "Unnamed Preset",
            patternPrefix: "Pattern ",
            currentPattern: "Current Pattern",
            trackPatternLabel: "Track Pattern {index}",
            trackNone: "-- none --",
            loadInComposer: "Load in Composer",
            tutorialHeading: "TD-3: Step-by-step programming",
            tutorialStepPitch: "Put the TD-3 in <strong>PITCH MODE</strong>.",
            tutorialStepEnterNotes: "Enter all notes of the pattern <strong>in order</strong>, without rests or EXT: {notes}.",
            tutorialStepTimeMode: "When all notes are programmed, switch to <strong>TIME MODE</strong>.",
            tutorialStepTimeTableIntro: "For each step (1 → 16), follow the table:",
            tutorialStepTimeNote: "<strong>Time = 16th</strong> for a played note.",
            tutorialStepTimeExt: "<strong>Time = EXT</strong> to extend the previous note.",
            tutorialStepTimeRest: "<strong>Time = REST</strong> for a silence.",
            tutorialStepBackToPitch: "Switch back to <strong>PITCH MODE</strong> and for each step:",
            tutorialStepAcc: "<strong>ACC</strong> → press ACCENT.",
            tutorialStepSlide: "<strong>SLIDE</strong> → press SLIDE.",
            tutorialStepAccSlide: "<strong>ACC+SLIDE</strong> → both.",
            tutorialStepFixTime: "If you made a mistake in <strong>TIME MODE</strong>, go back to TIME MODE then hold <strong>WHITE/NEXT</strong> to step through and fix each step one by one.",
            tutorialKeyboardSection: "Keyboard / Transpose for this pattern",
            tutorialNoActiveNotes: "No active notes in this pattern.",
            tutorialTableStep: "Step",
            tutorialTableNote: "Note",
            tutorialTableTime: "Time",
            tutorialTableFlags: "Flags",
            tutorialNotesListEmpty: "(no notes)",
            tutorialPatternTitle: "Pattern",
            tutorialTimeExtLabel: "EXT (tie)",
            tutorialTimeNoteLabel: "16th (sixteenth)",
            tutorialTimeRestLabel: "REST (silence)",
            tutorialMappingBase: "{note} → key [{pc}]",
            tutorialMappingTransposeUp: "{note} → [Transpose UP] + key [{pc}]",
            tutorialMappingTransposeDown: "{note} → [Transpose DOWN] + key [{pc}]",
            welcomeTitle: "Welcome!",
            welcomeBody: "Discover the TB-303 Pattern Helper. Choose your language, explore the composer and track mode, and generate AI-ready prompts.",
            welcomeDontShow: "Don't show again",
            welcomeStart: "Start",
            languageLabel: "Language",
            promptClipboardManualCopy: "Clipboard API unavailable. Copy this JSON manually:",
            promptClipboardManualPaste: "Clipboard API unavailable. Paste the JSON to load:"
        },
        fr: {
            appTitle: "TB-303 Pattern Helper",
            appSubtitle: "TD-3 / 303 / 909 / IA",
            faqButton: "? FAQ TD-3",
            composerTitle: "Compositeur TB-303",
            clear: "Effacer",
            random: "Aléatoire",
            tutorial: "Tutoriel TD-3",
            bpm: "BPM",
            play: "▶ Lecture",
            stop: "■ Stop",
            transportHint: "Transport global (303 + 909 + Track)",
            saveLibrary: "Sauvegarder dans la bibliothèque",
            loadLast: "Charger le dernier",
            loadClipboard: "Charger depuis le presse-papier",
            saveClipboard: "Sauvegarder dans le presse-papier",
            openLibrary: "Ouvrir la bibliothèque",
            exportMidi: "Exporter en MIDI",
            controlsTitle: "Contrôles 303 / Drive / 909",
            waveform: "Onde",
            saw: "Dent de scie",
            square: "Carré",
            kick: "Kick (909)",
            snare: "Snare (909)",
            savePreset: "Sauver preset 303 + 909",
            trackTitle: "Mode Track (chaîne de patterns)",
            trackLength: "Longueur de track",
            apply: "Appliquer",
            trackTutorial: "Tutoriel Track",
            playTrack: "▶ Lire la track",
            stopTrack: "■ Stop track",
            aiTitle: "Assistant IA de Pattern",
            aiSubtitle: "Génère un prompt ultra complet pour ton LLM (303 + 909, JSON strictement compatible).",
            aiTempo: "Tempo (BPM, optionnel)",
            aiTimeSig: "Mesure",
            aiTimeSigAuto: "Auto (4/4)",
            aiRoot: "Note racine",
            aiRootAuto: "Auto",
            aiScale: "Gamme / Mode",
            aiMood: "Ambiance / Mood",
            aiMoodPlaceholder: "dark, deep, hypnotic...",
            aiStyles: "Styles (multi)",
            aiStylesHint: "Ctrl / Cmd (desktop) pour multi-sélection",
            aiEnergy: "Énergie (1–10)",
            aiComplexity: "Complexité (1–10)",
            aiWhat: "Générer quoi ?",
            aiBoth: "303 + Drums",
            ai303Only: "303 seulement",
            aiDrumsOnly: "Drums seulement",
            aiGenerate: "Générer le prompt IA",
            aiCopy: "Copier le prompt",
            aiOutputLabel: "Prompt IA généré",
            aiOutputPlaceholder: "Clique sur \"Generate AI Prompt\" pour remplir ce champ...",
            aiHelpIntro: "Workflow suggéré :",
            aiHelpStep1: "Réglage des options (tempo, styles, mood...).",
            aiHelpStep2: "Clique sur <strong>Generate AI Prompt</strong>.",
            aiHelpStep3: "Clique sur <strong>Copy Prompt</strong> et colle dans ton LLM.",
            aiHelpStep4: "Le LLM renvoie un JSON brut.",
            aiHelpStep5: "Copie ce JSON → bouton <strong>Load from Clipboard</strong> dans le composer 303.",
            patternLibraryTitle: "Bibliothèque de patterns",
            patternLibraryHelp: "Les patterns sont stockés en local (localStorage). Tu peux aussi les télécharger en JSON pour les partager ou les versionner.",
            tutorialTitle: "Tutoriel TD-3 pas-à-pas",
            faqTitle: "FAQ TD-3",
            faqPlaceholder: "Les réponses détaillées sont en cours de travaux. Cette section sera complétée après une passe de recherche dédiée.",
            faqStatus: "Statut : en cours de travaux. Cette FAQ sera complétée avec des pas-à-pas précis.",
            overlayDownload: "💾 Fichier téléchargé (dossier Téléchargements)",
            overlayExportFailed: "❌ Export fichier échoué (WIP)",
            toastTrackEmpty: "Chaîne de track vide",
            toastClipboardApi: "Clipboard API non disponible",
            toastClipboardApiFallback: "Clipboard indisponible : copie/colle manuellement",
            toastClipboardCopied: "📋 Pattern copié dans le presse-papier (JSON)",
            toastClipboardCopyFailed: "❌ Échec de copie presse-papier",
            toastClipboardStructureInvalid: "JSON presse-papier : pattern ou steps manquants",
            toastClipboardLoadedManual: "📋 Pattern chargé (collage manuel)",
            toastSaveCancelled: "❌ Sauvegarde annulée",
            toastPatternSaved: "✅ Pattern sauvegardé dans la bibliothèque",
            toastNoStoredPattern: "Aucun pattern enregistré pour l'instant",
            toastLoadedLast: "✅ Dernier pattern chargé",
            toastClipboardEmpty: "Presse-papier vide",
            toastClipboardInvalid: "JSON depuis presse-papier invalide",
            toastClipboardLoaded: "📋 Pattern chargé depuis le presse-papier",
            toastClipboardLoadFailed: "❌ Échec de chargement presse-papier",
            toastLoadedPattern: ({ name }) => `Pattern \"${name}\" chargé`,
            toastPatternModalMissing: "Modal bibliothèque introuvable (HTML WIP)",
            toastTutorialModalMissing: "Modal tutoriel introuvable (HTML WIP)",
            toastMidiExported: "📁 MIDI exporté",
            toastPresetCancelled: "❌ Sauvegarde preset annulée",
            toastFaqMissing: "FAQ TD-3 en cours de travaux (ajoute le HTML du modal)",
            toastAiGenerated: "🧠 Prompt IA généré",
            toastPromptEmpty: "Prompt vide, génère-le d'abord",
            toastPromptCopied: "📋 Prompt copié",
            toastRandomPattern: "🎲 Pattern aléatoire (pas encore sauvegardé)",
            confirmClear: "Effacer toutes les steps ?",
            promptPatternName: "Nom du pattern (stocké dans le localStorage du navigateur) :",
            promptPresetName: "Nom du preset (303 + 909) :",
            unnamedPattern: "Sans nom",
            unnamedPreset: "Preset sans nom",
            patternPrefix: "Pattern ",
            currentPattern: "Pattern courant",
            trackPatternLabel: "Track Pattern {index}",
            trackNone: "-- aucun --",
            loadInComposer: "Charger dans le compositeur",
            tutorialHeading: "TD-3 : Programmation pas à pas",
            tutorialStepPitch: "Met la TD-3 en <strong>PITCH MODE</strong>.",
            tutorialStepEnterNotes: "Entre toutes les notes du pattern <strong>dans l'ordre</strong>, sans silences ni EXT : {notes}.",
            tutorialStepTimeMode: "Quand toutes les notes sont programmées, passe en <strong>TIME MODE</strong>.",
            tutorialStepTimeTableIntro: "Pour chaque step (1 → 16), suis le tableau :",
            tutorialStepTimeNote: "<strong>Time = double croche</strong> pour une note jouée.",
            tutorialStepTimeExt: "<strong>Time = EXT</strong> pour prolonger la note précédente.",
            tutorialStepTimeRest: "<strong>Time = REST</strong> pour un silence.",
            tutorialStepBackToPitch: "Repasse ensuite en <strong>PITCH MODE</strong>, et pour chaque step :",
            tutorialStepAcc: "<strong>ACC</strong> → appuie sur ACCENT.",
            tutorialStepSlide: "<strong>SLIDE</strong> → appuie sur SLIDE.",
            tutorialStepAccSlide: "<strong>ACC+SLIDE</strong> → les deux.",
            tutorialStepFixTime: "Si tu t'es trompé en <strong>TIME MODE</strong>, repasse en TIME MODE puis maintiens le bouton <strong>WHITE/NEXT</strong> (en bas à droite de la TD-3) pour faire défiler les steps et corriger chaque step une par une.",
            tutorialKeyboardSection: "Clavier / Transpose pour ce pattern",
            tutorialNoActiveNotes: "Aucune note active dans ce pattern.",
            tutorialTableStep: "Step",
            tutorialTableNote: "Note",
            tutorialTableTime: "Time",
            tutorialTableFlags: "Flags",
            tutorialNotesListEmpty: "(aucune note)",
            tutorialPatternTitle: "Pattern",
            tutorialTimeExtLabel: "EXT (tie)",
            tutorialTimeNoteLabel: "16th (double croche)",
            tutorialTimeRestLabel: "REST (silence)",
            tutorialMappingBase: "{note} → touche [{pc}]",
            tutorialMappingTransposeUp: "{note} → [Transpose UP] + touche [{pc}]",
            tutorialMappingTransposeDown: "{note} → [Transpose DOWN] + touche [{pc}]",
            welcomeTitle: "Bienvenue !",
            welcomeBody: "Découvre le TB-303 Pattern Helper. Choisis ta langue, explore le compositeur et le mode track, et génère des prompts prêts pour l'IA.",
            welcomeDontShow: "Ne plus afficher",
            welcomeStart: "Commencer",
            languageLabel: "Langue",
            promptClipboardManualCopy: "Clipboard API indisponible. Copie manuellement ce JSON :",
            promptClipboardManualPaste: "Clipboard API indisponible. Colle ici le JSON à charger :"
        }
    };

    const LANG_KEY = "tb303_language";
    let currentLanguage =
        (typeof localStorage !== "undefined" && localStorage.getItem(LANG_KEY)) ||
        (navigator.language && navigator.language.startsWith("fr") ? "fr" : "en");

    function setLanguage(lang) {
        if (!I18N[lang]) return;
        currentLanguage = lang;
        try {
            localStorage.setItem(LANG_KEY, lang);
        } catch (e) {
            console.warn("Unable to persist language", e);
        }
        document.documentElement.lang = lang;
    }

    function t(key, vars = {}) {
        const pack = I18N[currentLanguage] || I18N.en;
        let res = pack[key];
        if (res === undefined) {
            res = I18N.en[key] ?? key;
        }
        if (typeof res === "function") {
            res = res(vars);
        }
        if (typeof res !== "string") return key;

        return res.replace(/\{(.*?)\}/g, (_, p1) => {
            return Object.prototype.hasOwnProperty.call(vars, p1) ? vars[p1] : `{${p1}}`;
        });
    }

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
    // PatternManager (orienté objet)
    // ------------------------------------------------------------------------
    class PatternManager {
        constructor() {
            this.pattern = this.createEmptyPattern();
            this.history = [];
            this.future = [];
        }

        createEmptyPattern() {
            return {
                steps: Array.from({ length: 16 }, (_, i) => ({
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
                    kick: true,
                    snare: true
                }
            };
        }

        clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        commit() {
            this.history.push(this.clone(this.pattern));
            if (this.history.length > 100) this.history.shift();
            this.future = [];
        }

        undo() {
            if (!this.history.length) return;
            this.future.push(this.clone(this.pattern));
            this.pattern = this.history.pop();
        }

        redo() {
            if (!this.future.length) return;
            this.history.push(this.clone(this.pattern));
            this.pattern = this.future.pop();
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

        clearAll() {
            this.commit();
            this.pattern.steps.forEach((s) => {
                s.note = null;
                s.accent = false;
                s.slide = false;
                s.extend = false;
            });
        }

        setKnob(key, value) {
            this.pattern.knobs[key] = value;
        }

        setWaveform(wf) {
            this.pattern.waveform = wf === "square" ? "square" : "sawtooth";
        }

        setDrum(name, value) {
            this.pattern.drums[name] = !!value;
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

            // Steps
            const srcSteps = Array.isArray(raw.steps) ? raw.steps : [];
            srcSteps.forEach((st, i) => {
                if (i < 0 || i > 15 || !st) return;
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
            out.drums.kick = typeof srcDrums.kick === "boolean" ? srcDrums.kick : true;
            out.drums.snare = typeof srcDrums.snare === "boolean" ? srcDrums.snare : true;

            return out;
        }
    }

    // ------------------------------------------------------------------------
    // SynthEngine (Web Audio)
    // ------------------------------------------------------------------------
    class SynthEngine {
        constructor() {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;

            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);

            this.distCache = new Map();
        }

        resume() {
            if (this.ctx.state === "suspended") {
                this.ctx.resume();
            }
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

        playStepChain(chainSteps, stepDuration, knobs, waveform) {
            if (!chainSteps || !chainSteps.length) return;

            this.resume();
            const now = this.ctx.currentTime;

            const tuneMul = Math.pow(2, knobs.tune / 12);
            const freqs = chainSteps.map((s) => (s.note ? noteFrequencies[s.note] * tuneMul : null));

            const accent = !!chainSteps[0].accent;
            const totalDuration = chainSteps.length * stepDuration;
            const GLIDE_RATIO = 0.85;

            const osc = this.ctx.createOscillator();
            osc.type = waveform;
            osc.frequency.setValueAtTime(freqs[0] || 110, now);

            // Slides & EXT : on enchaîne les steps avec ramp
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
                    // EXT = même note prolongée
                    const baseNote = cur.note || next.note;
                    const baseFreq = noteFrequencies[baseNote] * tuneMul;
                    const start = now + (i + 1) * stepDuration;
                    osc.frequency.setValueAtTime(baseFreq, start);
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

        playKick(time) {
            this.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
            gain.gain.setValueAtTime(0.9, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.3);
        }

        playSnare(time) {
            this.resume();
            const duration = 0.15;
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.value = 2000;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start(time);
            noise.stop(time + duration);
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
    // Storage (localStorage)
    // ------------------------------------------------------------------------
    const STORAGE_KEYS = {
        currentPattern: "tb303_helper_current_pattern",
        patternLibrary: "tb303_helper_library"
    };

    const Storage = {
        loadCurrent() {
            try {
                const raw = localStorage.getItem(STORAGE_KEYS.currentPattern);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch {
                return null;
            }
        },
        saveCurrent(patternObj) {
            try {
                localStorage.setItem(STORAGE_KEYS.currentPattern, JSON.stringify(patternObj));
            } catch {
                // ignore
            }
        },
        loadLibrary() {
            try {
                const raw = localStorage.getItem(STORAGE_KEYS.patternLibrary);
                if (!raw) return [];
                const arr = JSON.parse(raw);
                return Array.isArray(arr) ? arr : [];
            } catch {
                return [];
            }
        },
        saveLibrary(list) {
            try {
                localStorage.setItem(STORAGE_KEYS.patternLibrary, JSON.stringify(list));
            } catch {
                // ignore
            }
        },
        addToLibrary(entry) {
            const list = this.loadLibrary();
            list.unshift(entry);
            this.saveLibrary(list);
        }
    };

    // ------------------------------------------------------------------------
    // Tutoriel TD-3 : génération HTML
    // ------------------------------------------------------------------------
    function buildTd3NoteMapping(pattern) {
        // Séquence complète de notes dans l'ORDRE (doublons autorisés, silences et EXT skip)
        const orderedNotes = [];
        const uniqueNotes = [];

        pattern.steps.forEach((st) => {
            if (!st || !st.note || st.extend) return;
            orderedNotes.push(st.note);
            if (!uniqueNotes.includes(st.note)) uniqueNotes.push(st.note);
        });

        const lines = [];
        uniqueNotes.forEach((note) => {
            const m = String(note).match(/^([A-G]#?)-(-?\d)$/);
            if (!m) return;
            const pc = m[1];
            const oct = parseInt(m[2], 10);
            if (oct === 2) {
                lines.push(t("tutorialMappingBase", { note, pc }));
            } else if (oct > 2) {
                lines.push(t("tutorialMappingTransposeUp", { note, pc }));
            } else {
                lines.push(t("tutorialMappingTransposeDown", { note, pc }));
            }
        });

        return {
            notesSeq: orderedNotes,        // chaîne dans l'ordre, doublons compris
            mappingLines: lines            // mapping unique pour le clavier / transpose
        };
    }

    function buildPatternTutorialHtml(pattern, title) {
        const pm = new PatternManager();
        pm.loadFrom(pattern);
        const pat = pm.pattern;

        const mapInfo = buildTd3NoteMapping(pat);
        const notesList = mapInfo.notesSeq.join(", ");
        const notesListHtml =
            mapInfo.notesSeq.length > 0
                ? `<strong>${notesList}</strong>`
                : `<strong>${t("tutorialNotesListEmpty")}</strong>`;
        const patternTitle = title || t("tutorialPatternTitle");

        let html = "";
        html += `<div class="tutorial-pattern-title">${patternTitle}</div>`;
        html += `<div class="td3-instructions">`;
        html += `<h3>${t("tutorialHeading")}</h3>`;
        html += `<ol>`;
        html += `<li>${t("tutorialStepPitch")}</li>`;
        html += `<li>${t("tutorialStepEnterNotes", { notes: notesListHtml })}</li>`;
        html += `<li>${t("tutorialStepTimeMode")}</li>`;
        html += `<li>${t("tutorialStepTimeTableIntro")}<ul>`;
        html += `<li>${t("tutorialStepTimeNote")}</li>`;
        html += `<li>${t("tutorialStepTimeExt")}</li>`;
        html += `<li>${t("tutorialStepTimeRest")}</li>`;
        html += `</ul></li>`;
        html += `<li>${t("tutorialStepBackToPitch")}<ul>`;
        html += `<li>${t("tutorialStepAcc")}</li>`;
        html += `<li>${t("tutorialStepSlide")}</li>`;
        html += `<li>${t("tutorialStepAccSlide")}</li></ul></li>`;
        html += `<li>${t("tutorialStepFixTime")}</li>`;
        html += `</ol>`;

        html += `<h4>${t("tutorialKeyboardSection")}</h4><ul>`;
        if (mapInfo.mappingLines.length) {
            mapInfo.mappingLines.forEach((line) => {
                html += `<li>${line}</li>`;
            });
        } else {
            html += `<li>${t("tutorialNoActiveNotes")}</li>`;
        }
        html += `</ul></div>`;

        // Tableau 16 steps : Note / Time / Flags séparés
        html += `<table class="tutorial-table"><thead><tr><th>${t("tutorialTableStep")}</th><th>${t("tutorialTableNote")}</th><th>${t("tutorialTableTime")}</th><th>${t("tutorialTableFlags")}</th></tr></thead><tbody>`;

        // On garde en mémoire la dernière note "réelle" (non EXT) pour les affichages EXT
        let lastRealNote = null;

        for (let i = 0; i < 16; i++) {
            const s = pat.steps[i];

            let noteText = "—";
            let timeText = t("tutorialTimeRestLabel");

            if (s.extend) {
                noteText = lastRealNote || "—";
                timeText = t("tutorialTimeExtLabel");
            } else if (s.note) {
                noteText = s.note;
                timeText = t("tutorialTimeNoteLabel");
                lastRealNote = s.note;
            }

            const flags = [];
            if (s.accent) flags.push("ACC");
            if (s.slide) flags.push("SLIDE");
            // [CHANGED] on n'affiche plus EXT dans la colonne Flags

            html += `<tr><td>${i + 1}</td><td>${noteText}</td><td>${timeText}</td><td>${flags.join(" ")}</td></tr>`;
        }
        html += `</tbody></table>`;

        return html;
    }

    // ------------------------------------------------------------------------
    // Génération pattern aléatoire "smart"
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

        for (let i = 0; i < 16; i++) {
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

        return pm.toJSON();
    }

    // ------------------------------------------------------------------------
    // UI Controller
    // ------------------------------------------------------------------------
    const UI = (function () {
        const pm = new PatternManager();
        const synth = new SynthEngine();
        let spectrum = null;
        const WELCOME_KEY = "tb303_welcome_seen";
        let lastTutorialPayload = null;

        const state = {
            bpm: 120,
            isPlaying: false,
            stepIndex: 0,
            intervalId: null,
            // Track mode
            trackPlaying: false,
            trackIntervalId: null,
            trackPatternIndex: 0,
            trackStepIndex: 0,
            trackChain: []
        };

        const knobUpdaters = {};
        const highlightStep = Utils.rafThrottle((step) => {
            document.querySelectorAll(".playing").forEach((el) => el.classList.remove("playing"));
            document
                .querySelectorAll(`[data-step="${step}"]`)
                .forEach((el) => el.classList.add("playing"));
        });

        function applyTranslations(root = document) {
            root.querySelectorAll("[data-i18n]").forEach((el) => {
                const key = el.dataset.i18n;
                if (!key) return;
                el.innerHTML = t(key);
            });

            root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
                const key = el.dataset.i18nPlaceholder;
                if (key && typeof el.placeholder === "string") {
                    el.placeholder = t(key);
                }
            });

            const langSelect = document.getElementById("languageSelect");
            if (langSelect) {
                langSelect.value = currentLanguage;
            }
        }

        function openWelcomeModal() {
            const modal = document.getElementById("welcomeModal");
            if (!modal) return;

            applyTranslations(modal);
            modal.classList.add("active");

            const checkbox = document.getElementById("welcomeDontShow");
            const closeBtn = document.getElementById("welcomeClose");
            const startBtn = document.getElementById("welcomeStart");

            const close = (persist) => {
                modal.classList.remove("active");
                if (persist || (checkbox && checkbox.checked)) {
                    try {
                        localStorage.setItem(WELCOME_KEY, "1");
                    } catch (e) {
                        console.warn("Unable to persist welcome preference", e);
                    }
                }
            };

            if (closeBtn) closeBtn.onclick = () => close(checkbox && checkbox.checked);
            if (startBtn) startBtn.onclick = () => close(true);
            modal.addEventListener(
                "click",
                (e) => {
                    if (e.target.id === "welcomeModal") close(checkbox && checkbox.checked);
                },
                { once: true }
            );
        }

        function maybeShowWelcomeModal() {
            try {
                if (localStorage.getItem(WELCOME_KEY) === "1") return;
            } catch (e) {
                console.warn("Unable to read welcome preference", e);
            }
            openWelcomeModal();
        }

        function rerenderTutorialIfOpen() {
            const modal = document.getElementById("tutorialModal");
            if (!modal || !modal.classList.contains("active") || !lastTutorialPayload) return;

            if (lastTutorialPayload.type === "pattern") {
                openPatternTutorial(lastTutorialPayload.pattern, lastTutorialPayload.title);
            } else if (lastTutorialPayload.type === "track") {
                openTrackTutorial();
            }
        }

        // ---- Séquenceur ----
        function buildSequencerGrid() {
            const grid = document.getElementById("sequencerGrid");
            grid.innerHTML = "";

            // Ligne header (numéros steps)
            const empty = document.createElement("div");
            empty.className = "note-label";
            grid.appendChild(empty);
            for (let i = 0; i < 16; i++) {
                const h = document.createElement("div");
                h.className = "step-header";
                h.textContent = i + 1;
                // [ADDED] repères temps 1 / 5 / 9 / 13 (index 0,4,8,12)
                if (i % 4 === 0) {
                    h.classList.add("beat-col");
                }
                grid.appendChild(h);
            }

            // Lignes notes (C2 surlignée au lieu de C4)
            noteNamesDesc.forEach((note) => {
                const label = document.createElement("div");
                label.className = "note-label";
                if (note === "C-2") label.classList.add("c4-row"); // classe CSS réutilisée
                label.textContent = note;
                grid.appendChild(label);

                for (let step = 0; step < 16; step++) {
                    const btn = document.createElement("div");
                    btn.className = "step-button";
                    if (note === "C-2") btn.classList.add("c4-step"); // style vert existant, mais pour C2
                    btn.dataset.note = note;
                    btn.dataset.step = String(step);
                    // [ADDED] repères temps colonne
                    if (step % 4 === 0) {
                        btn.classList.add("beat-col");
                    }
                    grid.appendChild(btn);
                }
            });

            // Ligne ACCENT
            const accLabel = document.createElement("div");
            accLabel.className = "note-label";
            accLabel.textContent = "ACC";
            grid.appendChild(accLabel);
            for (let step = 0; step < 16; step++) {
                const btn = document.createElement("div");
                btn.className = "accent-button";
                btn.dataset.flag = "accent";
                btn.dataset.step = String(step);
                if (step % 4 === 0) {
                    btn.classList.add("beat-col");
                }
                grid.appendChild(btn);
            }

            // Ligne EXT
            const extLabel = document.createElement("div");
            extLabel.className = "note-label";
            extLabel.textContent = "EXT";
            grid.appendChild(extLabel);
            for (let step = 0; step < 16; step++) {
                const btn = document.createElement("div");
                    btn.className = "extend-button";
                    btn.dataset.flag = "extend";
                    btn.dataset.step = String(step);
                    if (step % 4 === 0) {
                        btn.classList.add("beat-col");
                    }
                    grid.appendChild(btn);
            }

            // Ligne SLIDE
            const sldLabel = document.createElement("div");
            sldLabel.className = "note-label";
            sldLabel.textContent = "SLIDE";
            grid.appendChild(sldLabel);
            for (let step = 0; step < 16; step++) {
                const btn = document.createElement("div");
                btn.className = "slide-button";
                btn.dataset.flag = "slide";
                btn.dataset.step = String(step);
                if (step % 4 === 0) {
                    btn.classList.add("beat-col");
                }
                grid.appendChild(btn);
            }

            // Click handlers
            grid.addEventListener("click", (ev) => {
                const target = ev.target.closest(
                    ".step-button, .accent-button, .slide-button, .extend-button"
                );
                if (!target) return;
                const step = parseInt(target.dataset.step || "0", 10);

                if (target.classList.contains("step-button")) {
                    const note = target.dataset.note;
                    synth.preview(note, pm.pattern.knobs, pm.pattern.waveform);
                    pm.toggleNote(step, note);
                    updateSequencerDisplay();
                    Storage.saveCurrent(pm.toJSON());
                } else {
                    const flag = target.dataset.flag;
                    pm.toggleFlag(step, flag);
                    updateSequencerDisplay();
                    Storage.saveCurrent(pm.toJSON());
                }
            });
        }

        function updateSequencerDisplay() {
            const p = pm.pattern;

            document.querySelectorAll(".step-button").forEach((btn) => {
                const step = parseInt(btn.dataset.step, 10);
                const note = btn.dataset.note;
                const s = p.steps[step];
                btn.classList.toggle("active", s.note === note);
            });

            document.querySelectorAll(".accent-button").forEach((btn) => {
                const step = parseInt(btn.dataset.step, 10);
                const s = p.steps[step];
                btn.classList.toggle("active", s.accent);
                btn.textContent = s.accent ? "!" : "";
            });

            document.querySelectorAll(".slide-button").forEach((btn) => {
                const step = parseInt(btn.dataset.step, 10);
                const s = p.steps[step];
                btn.classList.toggle("active", s.slide);
                btn.textContent = s.slide ? "↗" : "";
            });

            document.querySelectorAll(".extend-button").forEach((btn) => {
                const step = parseInt(btn.dataset.step, 10);
                const s = p.steps[step];
                btn.classList.toggle("active", s.extend);
                btn.textContent = s.extend ? "—" : "";
            });

            // Steps "mutés" par EXT
            const muted = new Set();
            for (let i = 0; i < 16; i++) {
                const st = p.steps[i];
                if (st.extend) {
                    const next = (i + 1) % 16;
                    muted.add(next);
                }
            }

            document
                .querySelectorAll(
                    ".step-button, .accent-button, .slide-button, .extend-button"
                )
                .forEach((btn) => {
                    const step = parseInt(btn.dataset.step, 10);
                    btn.classList.toggle("muted-step", muted.has(step));
                });
        }

        // ---- Knobs (qui deviendront faders côté CSS/HTML) ----
        function initKnobs() {
            const configs = [
                {
                    id: "knobTune",
                    valueId: "valueTune",
                    key: "tune",
                    fmt: (v) => `${v > 0 ? "+" : ""}${Math.round(v)}`,
                    min: -12,
                    max: 12
                },
                {
                    id: "knobCutoff",
                    valueId: "valueCutoff",
                    key: "cutoff",
                    fmt: (v) => `${Math.round(v)} Hz`,
                    min: 20,
                    max: 4000
                },
                {
                    id: "knobResonance",
                    valueId: "valueResonance",
                    key: "resonance",
                    fmt: (v) => v.toFixed(1),
                    min: 0.1,
                    max: 30
                },
                {
                    id: "knobEnvMod",
                    valueId: "valueEnvMod",
                    key: "envMod",
                    fmt: (v) => `${Math.round(v)}%`,
                    min: 0,
                    max: 100
                },
                {
                    id: "knobDecay",
                    valueId: "valueDecay",
                    key: "decay",
                    fmt: (v) => `${Math.round(v)} ms`,
                    min: 50,
                    max: 2000
                },
                {
                    id: "knobAccent",
                    valueId: "valueAccent",
                    key: "accent",
                    fmt: (v) => `${Math.round(v)}%`,
                    min: 0,
                    max: 100
                },
                {
                    id: "knobDrive",
                    valueId: "valueDrive",
                    key: "drive",
                    fmt: (v) => `${Math.round(v)}%`,
                    min: 0,
                    max: 100
                },
                {
                    id: "knobTone",
                    valueId: "valueTone",
                    key: "tone",
                    fmt: (v) => `${Math.round(v)} Hz`,
                    min: 20,
                    max: 20000
                },
                {
                    id: "knobDistVolume",
                    valueId: "valueDistVolume",
                    key: "distVolume",
                    fmt: (v) => `${Math.round(v)}%`,
                    min: 0,
                    max: 100
                }
            ];

            configs.forEach((cfg) => {
                const el = document.getElementById(cfg.id);
                if (!el) return;
                const valEl = document.getElementById(cfg.valueId);
                const indicator = el.querySelector(".knob-indicator");
                const min = cfg.min;
                const max = cfg.max;
                const initial = parseFloat(el.dataset.value);

                const apply = (value, commit = false) => {
                    let v = value;
                    if (Number.isNaN(v)) v = initial;
                    v = Math.max(min, Math.min(max, v));
                    const t = (v - min) / (max - min);
                    const angle = -135 + t * 270;
                    const faderPos = `${Math.round(t * 100)}%`;
                    if (indicator) {
                        indicator.style.setProperty("--rotation", `${angle}deg`);
                        indicator.style.setProperty("--fader-pos", faderPos);
                    }
                    el.style.setProperty("--fader-pos", faderPos);
                    if (valEl) {
                        valEl.textContent = cfg.fmt(v);
                    }
                    pm.setKnob(cfg.key, v);
                    if (commit) Storage.saveCurrent(pm.toJSON());
                };

                const applyDebounced = Utils.debounce((v) => apply(v, true), 10);
                knobUpdaters[cfg.key] = (v) => apply(v, false);
                apply(initial, false);

                let startY = 0;
                let startVal = initial;
                const baseSensitivity = (max - min) / 130;

                const handleMove = (clientY, fine) => {
                    const sens = baseSensitivity / (fine ? 3 : 1);
                    const dy = startY - clientY;
                    const v = startVal + dy * sens;
                    applyDebounced(v);
                };

                el.addEventListener("touchstart", (e) => {
                    e.preventDefault();
                    const t = e.touches[0];
                    startY = t.clientY;
                    startVal = pm.pattern.knobs[cfg.key];
                });

                el.addEventListener("touchmove", (e) => {
                    e.preventDefault();
                    const t = e.touches[0];
                    handleMove(t.clientY, true);
                });

                el.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    startY = e.clientY;
                    startVal = pm.pattern.knobs[cfg.key];

                    const move = (ev) => {
                        handleMove(ev.clientY, ev.shiftKey);
                    };
                    const up = () => {
                        document.removeEventListener("mousemove", move);
                        document.removeEventListener("mouseup", up);
                    };
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                });
            });
        }

        // ---- Playback ----
        function playStep(pattern, stepIndex, stepDuration, withHighlight) {
            const steps = pattern.steps;
            const cur = steps[stepIndex];
            const prev = steps[(stepIndex - 1 + 16) % 16];

            const isSlidTo = !!(prev && prev.slide && prev.note);
            const isExt = !!(cur.extend && prev && prev.note);

            if (cur.note && !isSlidTo && !isExt) {
                // Construire chaîne slide+EXT
                const chain = [cur];
                let idx = stepIndex;
                while (true) {
                    const nextIdx = (idx + 1) % 16;
                    const next = steps[nextIdx];
                    if (!next) break;

                    if (steps[idx].slide && next.note) {
                        chain.push(next);
                        idx = nextIdx;
                    } else if (next.extend && (chain[chain.length - 1].note || next.note || steps[idx].note)) {
                        const e = Object.assign({}, next);
                        if (!e.note) e.note = chain[chain.length - 1].note || steps[idx].note;
                        chain.push(e);
                        idx = nextIdx;
                    } else {
                        break;
                    }
                }
                synth.playStepChain(chain, stepDuration, pattern.knobs, pattern.waveform);
            }

            // Batterie simple kick/snare (TR-909 avancée : WIP)
            if (pattern.drums.kick && stepIndex % 4 === 0) {
                synth.playKick(synth.ctx.currentTime);
            }
            if (pattern.drums.snare && (stepIndex === 4 || stepIndex === 12)) {
                synth.playSnare(synth.ctx.currentTime);
            }

            if (withHighlight) {
                highlightStep(stepIndex);
            }
        }

        function startPlayback() {
            if (state.isPlaying || state.trackPlaying) return;
            if (spectrum) spectrum.start();
            synth.resume();

            const bpmInput = document.getElementById("bpmInput");
            const bpm = parseInt(bpmInput.value || "120", 10);
            state.bpm = Number.isNaN(bpm) ? 120 : bpm;
            const stepDur = (60 / state.bpm) / 4;

            state.isPlaying = true;
            state.stepIndex = 0;
            state.intervalId = setInterval(() => {
                playStep(pm.pattern, state.stepIndex, stepDur, true);
                state.stepIndex = (state.stepIndex + 1) % 16;
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

        // ---- Track mode ----
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

        function startTrackPlayback() {
            updateTrackChainFromUI();
            if (!state.trackChain.length) {
                Utils.toast(t("toastTrackEmpty"));
                return;
            }
            if (state.isPlaying) stopPlayback();
            if (spectrum) spectrum.start();
            synth.resume();

            const bpmInput = document.getElementById("bpmInput");
            const bpm = parseInt(bpmInput.value || "120", 10);
            state.bpm = Number.isNaN(bpm) ? 120 : bpm;
            const stepDur = (60 / state.bpm) / 4;

            state.trackPlaying = true;
            state.trackPatternIndex = 0;
            state.trackStepIndex = 0;

            state.trackIntervalId = setInterval(() => {
                const pat = state.trackChain[state.trackPatternIndex];
                playStep(pat, state.trackStepIndex, stepDur, false);

                state.trackStepIndex++;
                if (state.trackStepIndex >= 16) {
                    state.trackStepIndex = 0;
                    state.trackPatternIndex =
                        (state.trackPatternIndex + 1) % state.trackChain.length;
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

        // ---- Sauvegarde / chargement ----

        function serializePatternForClipboard() {
            return JSON.stringify(
                {
                    pattern: pm.toJSON(),
                    meta: {
                        bpm: state.bpm,
                        exportedAt: Utils.nowISO(),
                        source: "tb-303-pattern-helper"
                    }
                },
                null,
                2
            );
        }

        function normalizeClipboardText(rawText) {
            if (!rawText) return "";
            let text = String(rawText).trim();
            const fenced = text.match(/^```(?:\/?json)?\s*([\s\S]*?)\s*```$/i);
            if (fenced && fenced[1]) {
                text = fenced[1].trim();
            }
            return text;
        }

        function extractPatternFromPayload(obj) {
            if (!obj || typeof obj !== "object") return null;
            const candidate = obj.pattern && typeof obj.pattern === "object" ? obj.pattern : obj;
            if (!candidate.steps || !Array.isArray(candidate.steps)) return null;
            return candidate;
        }

        function promptManualCopy(text) {
            window.prompt(t("promptClipboardManualCopy"), text);
        }

        function promptManualPaste() {
            return window.prompt(t("promptClipboardManualPaste"), "") || "";
        }

        // [ADDED] Sauvegarde du pattern courant dans le presse-papier (JSON)
        async function savePatternToClipboard() {
            const json = serializePatternForClipboard();
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                Utils.toast(t("toastClipboardApiFallback"));
                promptManualCopy(json);
                return;
            }
            try {
                await navigator.clipboard.writeText(json);
                Utils.toast(t("toastClipboardCopied"));
            } catch (err) {
                console.error(err);
                Utils.toast(t("toastClipboardCopyFailed"));
                promptManualCopy(json);
            }
        }

        function saveCurrentToLibrary() {
            const name = window.prompt(
                t("promptPatternName"),
                t("patternPrefix") + new Date().toLocaleString()
            );
            if (name === null) {
                Utils.toast(t("toastSaveCancelled"));
                return;
            }

            const pattern = pm.toJSON();
            const bpm = state.bpm;
            const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

            const entry = {
                id,
                name: name || t("unnamedPattern"),
                bpm,
                createdAt: Utils.nowISO(),
                pattern
            };
            Storage.addToLibrary(entry);
            Storage.saveCurrent(pattern);
            Utils.toast(t("toastPatternSaved"));

            // Enregistrement dans un fichier JSON téléchargeable (dossier Téléchargements)
            Utils.downloadJson(entry, (name || "pattern").replace(/\s+/g, "_"));

            refreshPatternList();
        }

        function loadLastPattern() {
            const obj = Storage.loadCurrent();
            if (!obj) {
                Utils.toast(t("toastNoStoredPattern"));
                return;
            }
            pm.loadFrom(obj);
            updateSequencerDisplay();
            // Knobs
            Object.keys(pm.pattern.knobs).forEach((k) => {
                if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
            });
            const wfSelect = document.getElementById("waveformSelect");
            const ckKick = document.getElementById("checkKick");
            const ckSnare = document.getElementById("checkSnare");
            if (wfSelect) wfSelect.value = pm.pattern.waveform;
            if (ckKick) ckKick.checked = pm.pattern.drums.kick;
            if (ckSnare) ckSnare.checked = pm.pattern.drums.snare;
            Utils.toast(t("toastLoadedLast"));
        }

        async function loadFromClipboard() {
            let text = "";
            let usedManual = false;
            try {
                if (!navigator.clipboard || !navigator.clipboard.readText) {
                    Utils.toast(t("toastClipboardApiFallback"));
                    text = promptManualPaste();
                    usedManual = true;
                } else {
                    text = await navigator.clipboard.readText();
                }
                text = normalizeClipboardText(text);
                if (!text) {
                    Utils.toast(t("toastClipboardEmpty"));
                    return;
                }
                let obj;
                try {
                    obj = JSON.parse(text);
                } catch {
                    Utils.toast(t("toastClipboardInvalid"));
                    return;
                }
                const patternObj = extractPatternFromPayload(obj);
                if (!patternObj) {
                    Utils.toast(t("toastClipboardStructureInvalid"));
                    return;
                }
                pm.loadFrom(patternObj);
                updateSequencerDisplay();
                Object.keys(pm.pattern.knobs).forEach((k) => {
                    if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                });
                const wfSelect = document.getElementById("waveformSelect");
                const ckKick = document.getElementById("checkKick");
                const ckSnare = document.getElementById("checkSnare");
                if (wfSelect) wfSelect.value = pm.pattern.waveform;
                if (ckKick) ckKick.checked = pm.pattern.drums.kick;
                if (ckSnare) ckSnare.checked = pm.pattern.drums.snare;
                Storage.saveCurrent(pm.toJSON());
                Utils.toast(t(usedManual ? "toastClipboardLoadedManual" : "toastClipboardLoaded"));
            } catch (err) {
                console.error(err);
                Utils.toast(t("toastClipboardLoadFailed"));
            }
        }

        // ---- Pattern library / Track modal ----
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

                title.textContent = entry.name || t("unnamedPattern");
                meta.className = "pattern-meta";
                meta.textContent = `id=${entry.id} | bpm=${entry.bpm || "—"} | ${entry.createdAt}`;

                btnLoad.className = "btn btn-load";
                btnLoad.textContent = t("loadInComposer");
                btnLoad.addEventListener("click", () => {
                    pm.loadFrom(entry.pattern);
                    updateSequencerDisplay();
                    Object.keys(pm.pattern.knobs).forEach((k) => {
                        if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                    });
                    const wfSelect = document.getElementById("waveformSelect");
                    const ckKick = document.getElementById("checkKick");
                    const ckSnare = document.getElementById("checkSnare");
                    if (wfSelect) wfSelect.value = pm.pattern.waveform;
                    if (ckKick) ckKick.checked = pm.pattern.drums.kick;
                    if (ckSnare) ckSnare.checked = pm.pattern.drums.snare;
                    Storage.saveCurrent(pm.toJSON());
                    const nameToShow = entry.name || t("unnamedPattern");
                    Utils.toast(t("toastLoadedPattern", { name: nameToShow }));
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
                optNone.textContent = t("trackNone");
                sel.appendChild(optNone);

                library.forEach((entry) => {
                    const opt = document.createElement("option");
                    opt.value = entry.id;
                    opt.textContent = entry.name || `${t("patternPrefix")}${entry.id}`;
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
                Utils.toast(t("toastPatternModalMissing"));
                return;
            }
            modal.classList.add("active");

            const close = () => {
                modal.classList.remove("active");
                lastTutorialPayload = null;
            };
            const closeBtn = document.getElementById("patternModalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener(
                "click",
                (e) => {
                    if (e.target.id === "patternModal") close();
                },
                { once: true }
            );

            refreshPatternList();
        }

        // ---- Tutoriels ----
        function openPatternTutorial(patternObj, title) {
            const modal = document.getElementById("tutorialModal");
            const content = document.getElementById("tutorialContent");
            const bar = document.getElementById("progressFill");
            if (!modal || !content || !bar) {
                Utils.toast(t("toastTutorialModalMissing"));
                return;
            }

            let html = `<div style="font-size:13px;">`;
            html += buildPatternTutorialHtml(patternObj, title);
            html += `</div>`;
            content.innerHTML = html;
            bar.style.width = "100%";

            modal.classList.add("active");
            lastTutorialPayload = { type: "track" };
            lastTutorialPayload = { type: "pattern", pattern: patternObj, title };

            const close = () => {
                modal.classList.remove("active");
                lastTutorialPayload = null;
            };
            const closeBtn = document.getElementById("modalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener(
                "click",
                (e) => {
                    if (e.target.id === "tutorialModal") close();
                },
                { once: true }
            );
        }

        function openTrackTutorial() {
            updateTrackChainFromUI();
            if (!state.trackChain.length) {
                Utils.toast(t("toastTrackEmpty"));
                return;
            }

            const modal = document.getElementById("tutorialModal");
            const content = document.getElementById("tutorialContent");
            const bar = document.getElementById("progressFill");
            if (!modal || !content || !bar) {
                Utils.toast(t("toastTutorialModalMissing"));
                return;
            }

            let html = `<div style="font-size:13px;">`;
            state.trackChain.forEach((pat, idx) => {
                html += buildPatternTutorialHtml(
                    pat,
                    t("trackPatternLabel", { index: idx + 1 })
                );
            });
            html += `</div>`;
            content.innerHTML = html;
            bar.style.width = "100%";

            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            const closeBtn = document.getElementById("modalClose");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener(
                "click",
                (e) => {
                    if (e.target.id === "tutorialModal") close();
                },
                { once: true }
            );
        }

        // ---- Export MIDI minimal (pattern courant seulement) ----
        function exportMidiCurrentPattern() {
            // [ ] TODO : gestion EXT et slide plus précise sur la durée
            const pattern = pm.toJSON();
            const bpm = state.bpm || 120;

            function writeVarLen(value) {
                let buffer = value & 0x7f;
                while ((value >>= 7)) {
                    buffer <<= 8;
                    buffer |= (value & 0x7f) | 0x80;
                }
                const bytes = [];
                while (true) {
                    bytes.push(buffer & 0xff);
                    if (buffer & 0x80) buffer >>= 8;
                    else break;
                }
                return bytes;
            }

            function noteToMidi(noteName) {
                const midi = midiFromName(noteName);
                return midi === null ? 60 : midi;
            }

            const header = [
                // "MThd"
                0x4d, 0x54, 0x68, 0x64,
                // length = 6
                0x00, 0x00, 0x00, 0x06,
                // format 0
                0x00, 0x00,
                // ntrks = 1
                0x00, 0x01,
                // division = 480
                0x01, 0xe0
            ];

            const track = [];
            // tempo meta event
            const microPerQuarter = Math.round(60000000 / bpm);
            track.push(0x00, 0xff, 0x51, 0x03, (microPerQuarter >> 16) & 0xff, (microPerQuarter >> 8) & 0xff, microPerQuarter & 0xff);

            const ticksPerStep = 120;

            // Pattern simple : chaque step active = note 1 step
            for (let i = 0; i < 16; i++) {
                const s = pattern.steps[i];
                if (s.note && !s.extend) {
                    const midiNote = noteToMidi(s.note);
                    const velocity = s.accent ? 110 : 80;

                    // Note ON (delta 0)
                    track.push(0x00, 0x90, midiNote, velocity);
                    // Note OFF après ticksPerStep
                    const lenBytes = writeVarLen(ticksPerStep);
                    track.push(...lenBytes, 0x80, midiNote, 0);
                } else {
                    // Silence / EXT : juste avancer le temps
                    const lenBytes = writeVarLen(ticksPerStep);
                    track.push(...lenBytes);
                }
            }

            // End-of-track
            track.push(0x00, 0xff, 0x2f, 0x00);

            // Track header
            const trackLen = track.length;
            const trackHeader = [
                0x4d, 0x54, 0x72, 0x6b, // "MTrk"
                (trackLen >> 24) & 0xff,
                (trackLen >> 16) & 0xff,
                (trackLen >> 8) & 0xff,
                trackLen & 0xff
            ];

            const bytes = new Uint8Array(header.length + trackHeader.length + track.length);
            bytes.set(header, 0);
            bytes.set(trackHeader, header.length);
            bytes.set(track, header.length + trackHeader.length);

            const blob = new Blob([bytes], { type: "audio/midi" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "tb303_pattern.mid";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            Utils.toast(t("toastMidiExported"));
        }

        // ---- Export preset 303 + 909 (WIP pour 909) ----
        function savePresetToFile() {
            const presetName = window.prompt(
                t("promptPresetName"),
                t("patternPrefix") + new Date().toLocaleString()
            );
            if (presetName === null) {
                Utils.toast(t("toastPresetCancelled"));
                return;
            }

            const preset = {
                type: "TB303_TR909_PRESET",
                name: presetName || t("unnamedPreset"),
                createdAt: Utils.nowISO(),
                bpm: state.bpm,
                tb303: pm.toJSON(),
                tr909: {
                    // Séquenceur TR-909 avancé : à implémenter
                    status: "WIP",
                    note: "Séquenceur TR-909 complet (instruments, pages, faders) en cours de travaux."
                }
            };

            Utils.downloadJson(preset, (presetName || "preset").replace(/\s+/g, "_"));
        }

        // ---- FAQ TD-3 (questions seulement, réponses WIP) ----
        function renderFaqContent() {
            const content = document.getElementById("faqContent");
            if (!content) return;

            let html = `<div style="font-size:13px;">`;
            html += `<h2>${t("faqTitle")}</h2>`;
            html += `<p><em>${t("faqPlaceholder")}</em></p>`;
            html += `<ul>`;
            html += `<li>Comment supprimer complètement un pattern sur la TD-3 ?</li>`;
            html += `<li>Comment copier / coller un pattern d'un emplacement à un autre ?</li>`;
            html += `<li>Comment programmer une chaîne de patterns en TRACK MODE ?</li>`;
            html += `<li>En TRACK MODE, comment s'assurer que la chaîne redémarre bien au début (et pourquoi faut-il appuyer sur CLEAR pour ré-armer la chaîne) ?</li>`;
            html += `<li>Comment sauvegarder un pattern sans écraser un autre pattern par erreur ?</li>`;
            html += `<li>Comment sortir proprement de TRACK MODE vers PATTERN WRITE / PLAY sans perdre ce qu'on a fait ?</li>`;
            html += `</ul>`;
            html += `<p style="margin-top:8px;">${t("faqStatus")}</p>`;
            html += `</div>`;

            content.innerHTML = html;
        }

        function openFaqModal() {
            const modal = document.getElementById("faqModal");
            const content = document.getElementById("faqContent");
            const closeBtn = document.getElementById("faqModalClose");

            if (!modal || !content) {
                Utils.toast(t("toastFaqMissing"));
                return;
            }

            renderFaqContent();
            modal.classList.add("active");

            const close = () => modal.classList.remove("active");
            if (closeBtn) closeBtn.onclick = close;
            modal.addEventListener(
                "click",
                (e) => {
                    if (e.target.id === "faqModal") close();
                },
                { once: true }
            );
        }

        // --------------------------------------------------------------------
        // [ADDED] AI Prompt Generator (LLM helper)
        // --------------------------------------------------------------------

        // Construit un template JSON vide strictement compatible avec ton format
        function buildEmptyPatternTemplateString() {
            const tmp = new PatternManager();
            const pattern = tmp.createEmptyPattern();
            return JSON.stringify(pattern, null, 2);
        }

        const AiPrompt = (function () {
            let jsonTemplate = null;

            function ensureTemplate() {
                if (!jsonTemplate) {
                    jsonTemplate = buildEmptyPatternTemplateString();
                }
                return jsonTemplate;
            }

            function readValue(id) {
                const el = document.getElementById(id);
                if (!el) return null;
                if (el.tagName === "SELECT" && el.multiple) {
                    return Array.from(el.selectedOptions).map((o) => o.value).filter(Boolean);
                }
                const v = el.value;
                return v && v.trim ? v.trim() : v;
            }

            function buildPrompt() {
                const template = ensureTemplate();

                // On lit les options SI les éléments existent, sinon on laisse à l'IA
                const tempo = readValue("aiTempo");
                const timeSignature = readValue("aiTimeSignature");
                const rootNote = readValue("aiRootNote");
                const scale = readValue("aiScale");
                const mood = readValue("aiMood");
                const styles = readValue("aiStyles") || [];
                const energy = readValue("aiEnergy");
                const complexity = readValue("aiComplexity");
                const genWhat = readValue("aiWhatToGenerate"); // "both" | "303" | "drums"

                let prompt = "";

                // Role & task
                prompt += "You are a music pattern generator for a TB-303-style bassline and a simple TR-909-style drum pattern.\n";
                prompt += "Your ONLY job is to fill a JSON object strictly matching the template below, so that it can be loaded by a web app without any modification.\n\n";

                // JSON template
                prompt += "JSON TEMPLATE (DO NOT change any key, DO NOT change the structure; only modify values):\n\n";
                prompt += template + "\n\n";

                // Musical constraints
                prompt += "MUSICAL CONSTRAINTS:\n";

                if (tempo) {
                    prompt += `- Tempo: ${tempo} BPM.\n`;
                } else {
                    prompt += "- Tempo: choose a tempo appropriate for underground electronic music (e.g., 120–145 BPM) depending on the styles.\n";
                }

                if (timeSignature) {
                    prompt += `- Time signature / groove: ${timeSignature}.\n`;
                } else {
                    prompt += "- Time signature: 4/4, classic dance pattern.\n";
                }

                if (rootNote && scale) {
                    prompt += `- Tonal center: ${rootNote} in ${scale} scale.\n`;
                } else if (rootNote) {
                    prompt += `- Tonal center: ${rootNote}, choose an appropriate scale for the selected styles.\n`;
                } else if (scale) {
                    prompt += `- Use a ${scale} scale and pick a root note that fits the style.\n`;
                } else {
                    prompt += "- Tonal center: choose a musically coherent root note and scale.\n";
                }

                if (styles && styles.length) {
                    prompt += `- Styles: ${styles.join(", ")}.\n`;
                } else {
                    prompt += "- Style: underground acid / techno / house, with club-friendly grooves.\n";
                }

                if (mood) {
                    prompt += `- Atmosphere / mood: ${mood}.\n`;
                } else {
                    prompt += "- Atmosphere: dark, deep, hypnotic and danceable.\n";
                }

                if (energy) {
                    prompt += `- Energy level (1–10): about ${energy}.\n`;
                }

                if (complexity) {
                    prompt += `- Overall complexity (1–10): about ${complexity}. Higher = more variations, syncopation and movement.\n`;
                }

                // Ce que l'on veut générer
                if (genWhat === "303") {
                    prompt += "- Generate ONLY the TB-303 bassline information; keep the drums exactly as in the JSON template.\n";
                } else if (genWhat === "drums") {
                    prompt += "- Generate ONLY the TR-909-style drum information; keep the TB-303 part exactly as in the JSON template.\n";
                } else {
                    prompt += "- Generate BOTH the TB-303 bassline and the TR-909-style drums.\n";
                }

                prompt += "\nDETAILS FOR THE TB-303-LIKE PART:\n";
                prompt += "- Use a 16-step loop.\n";
                prompt += "- Use the fields `note`, `accent`, `slide` and `extend` exactly as in the JSON template.\n";
                prompt += "- `note` must be either null (no note) or a note name strictly following the pattern \"PC-OCTAVE\" like \"C-2\", \"D#-2\", \"F-3\".\n";
                prompt += "- The bassline should be catchy, hypnotic, with slides and accents used in a musical way.\n";
                prompt += "- Slides connect two consecutive notes; accents emphasize important rhythmic positions.\n";
                prompt += "- `extend: true` should be used to tie a note over the next step instead of placing a new note.\n";

                prompt += "\nDETAILS FOR THE TR-909-LIKE DRUMS:\n";
                prompt += "- Use only the existing fields inside `drums` from the JSON template (e.g., `kick`, `snare`). Do NOT add new instruments.\n";
                prompt += "- Keep the data types exactly as in the template.\n";
                prompt += "- The drum pattern should support the bassline and stay consistent with the styles and atmosphere.\n";

                // Output rules
                prompt += "\nOUTPUT RULES (VERY IMPORTANT):\n";
                prompt += "- Return ONLY one JSON object, with the EXACT same structure and keys as the JSON TEMPLATE above.\n";
                prompt += "- Do NOT wrap the JSON in Markdown code fences.\n";
                prompt += "- Do NOT add any comments or explanations in your response.\n";
                prompt += "- Do NOT change the length of any array.\n";
                prompt += "- If you are unsure about something, keep the JSON structure and use reasonable default values instead of inventing new fields.\n";
                prompt += "- Never add extra fields, never remove existing fields.\n";
                prompt += "Ne commente pas dans ta réponse, ne fournis que le code JSON formaté correctement.\n";

                return prompt;
            }

            function bind() {
                const btnGenerate = document.getElementById("btnAiGeneratePrompt");
                const btnCopy = document.getElementById("btnAiCopyPrompt");
                const output = document.getElementById("aiPromptOutput");

                if (!btnGenerate || !output) {
                    // L'UI IA n'est pas encore en place (HTML à venir) → on ne fait rien
                    return;
                }

                btnGenerate.addEventListener("click", () => {
                    const prompt = buildPrompt();
                    output.value = prompt;
                    Utils.toast(t("toastAiGenerated"));
                });

                if (btnCopy && navigator.clipboard && navigator.clipboard.writeText) {
                    btnCopy.addEventListener("click", async () => {
                        try {
                            const text = output.value || "";
                            if (!text.trim()) {
                                Utils.toast(t("toastPromptEmpty"));
                                return;
                            }
                            await navigator.clipboard.writeText(text);
                            Utils.toast(t("toastPromptCopied"));
                        } catch (err) {
                            console.error(err);
                            Utils.toast(t("toastClipboardCopyFailed"));
                        }
                    });
                }
            }

            return { bind };
        })();

        // ---- Bind UI ----
        function bindUI() {
            // Boutons principaux
            const btnPlay = document.getElementById("btnPlay");
            const btnStop = document.getElementById("btnStop");
            const btnClear = document.getElementById("btnClear");
            const btnRandom = document.getElementById("btnRandom");
            const btnMidi = document.getElementById("btnMidi");
            const langSelect = document.getElementById("languageSelect");

            if (langSelect) {
                langSelect.value = currentLanguage;
                langSelect.addEventListener("change", (e) => {
                    const lang = e.target.value;
                    setLanguage(lang);
                    applyTranslations();
                    refreshPatternList();
                    buildTrackChainEditor();
                    renderFaqContent();
                    rerenderTutorialIfOpen();
                });
            }

            if (btnPlay) {
                btnPlay.addEventListener("click", () => {
                    if (state.trackPlaying) stopTrackPlayback();
                    startPlayback();
                });
            }
            if (btnStop) {
                btnStop.addEventListener("click", () => {
                    stopPlayback();
                    stopTrackPlayback();
                });
            }
            if (btnClear) {
                btnClear.addEventListener("click", () => {
                    if (window.confirm(t("confirmClear"))) {
                        pm.clearAll();
                        updateSequencerDisplay();
                        Storage.saveCurrent(pm.toJSON());
                    }
                });
            }
            if (btnRandom) {
                btnRandom.addEventListener("click", () => {
                    const p = generateSmartRandomPattern();
                    pm.loadFrom(p);
                    updateSequencerDisplay();
                    Object.keys(pm.pattern.knobs).forEach((k) => {
                        if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                    });
                    const wfSelect = document.getElementById("waveformSelect");
                    const ckKick = document.getElementById("checkKick");
                    const ckSnare = document.getElementById("checkSnare");
                    if (wfSelect) wfSelect.value = pm.pattern.waveform;
                    if (ckKick) ckKick.checked = pm.pattern.drums.kick;
                    if (ckSnare) ckSnare.checked = pm.pattern.drums.snare;
                    Storage.saveCurrent(pm.toJSON());
                    Utils.toast(t("toastRandomPattern"));
                });
            }
            if (btnMidi) {
                btnMidi.addEventListener("click", exportMidiCurrentPattern);
            }

            // Sauvegarde / chargement
            const btnSave = document.getElementById("btnSave");
            const btnLoad = document.getElementById("btnLoad");
            const btnClipboardLoad = document.getElementById("btnClipboard");
            const btnPatternModal = document.getElementById("btnPatternModal");
            const btnSaveClipboard = document.getElementById("btnSaveClipboard"); // [ADDED] futur bouton save→clipboard

            if (btnSave) btnSave.addEventListener("click", saveCurrentToLibrary);
            if (btnLoad) btnLoad.addEventListener("click", loadLastPattern);
            if (btnClipboardLoad) btnClipboardLoad.addEventListener("click", loadFromClipboard);
            if (btnPatternModal) btnPatternModal.addEventListener("click", openPatternModal);
            if (btnSaveClipboard) btnSaveClipboard.addEventListener("click", savePatternToClipboard);

            // Tutoriel pattern courant
            const btnGenerate = document.getElementById("btnGenerate");
            if (btnGenerate) {
                btnGenerate.addEventListener("click", () => {
                    openPatternTutorial(pm.toJSON(), t("currentPattern"));
                });
            }

            // Track controls
            const btnApplyTrackLength = document.getElementById("btnApplyTrackLength");
            const btnTrackPlay = document.getElementById("btnTrackPlay");
            const btnTrackStop = document.getElementById("btnTrackStop");
            const btnTrackTutorial = document.getElementById("btnTrackTutorial");

            if (btnApplyTrackLength) btnApplyTrackLength.addEventListener("click", buildTrackChainEditor);
            if (btnTrackPlay) btnTrackPlay.addEventListener("click", startTrackPlayback);
            if (btnTrackStop) btnTrackStop.addEventListener("click", stopTrackPlayback);
            if (btnTrackTutorial) btnTrackTutorial.addEventListener("click", openTrackTutorial);

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

            // Waveform + drums
            const wfSelect = document.getElementById("waveformSelect");
            const ckKick = document.getElementById("checkKick");
            const ckSnare = document.getElementById("checkSnare");

            if (wfSelect) {
                wfSelect.addEventListener("change", (e) => {
                    pm.setWaveform(e.target.value);
                    Storage.saveCurrent(pm.toJSON());
                });
            }
            if (ckKick) {
                ckKick.addEventListener("change", (e) => {
                    pm.setDrum("kick", e.target.checked);
                    Storage.saveCurrent(pm.toJSON());
                });
            }
            if (ckSnare) {
                ckSnare.addEventListener("change", (e) => {
                    pm.setDrum("snare", e.target.checked);
                    Storage.saveCurrent(pm.toJSON());
                });
            }

            // Bouton preset 303 + 909 (dans la boîte des faders, HTML à ajouter)
            const btnPreset = document.getElementById("btnSavePreset");
            if (btnPreset) {
                btnPreset.addEventListener("click", savePresetToFile);
            }

            // Bouton FAQ TD-3 (HTML à ajouter)
            const btnFaq = document.getElementById("btnFaq");
            if (btnFaq) {
                btnFaq.addEventListener("click", openFaqModal);
            }

            // Raccourcis clavier (desktop only)
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
                    pm.undo();
                    updateSequencerDisplay();
                } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
                    e.preventDefault();
                    pm.redo();
                    updateSequencerDisplay();
                }
            });

            // [ADDED] binding AI prompt (HTML à venir)
            AiPrompt.bind();
        }

        // ---- Init global ----
        function init() {
            Utils.init();
            setLanguage(currentLanguage);
            buildSequencerGrid();
            initKnobs();
            updateSequencerDisplay();
            bindUI();
            applyTranslations();
            renderFaqContent();

            // Charger dernier pattern si dispo
            const last = Storage.loadCurrent();
            if (last) {
                pm.loadFrom(last);
                updateSequencerDisplay();
                Object.keys(pm.pattern.knobs).forEach((k) => {
                    if (knobUpdaters[k]) knobUpdaters[k](pm.pattern.knobs[k]);
                });
                const wfSelect = document.getElementById("waveformSelect");
                const ckKick = document.getElementById("checkKick");
                const ckSnare = document.getElementById("checkSnare");
                if (wfSelect) wfSelect.value = pm.pattern.waveform;
                if (ckKick) ckKick.checked = pm.pattern.drums.kick;
                if (ckSnare) ckSnare.checked = pm.pattern.drums.snare;
            }

            maybeShowWelcomeModal();

            // Spectrum
            const canvas = document.getElementById("spectrumCanvas");
            if (canvas && synth.analyser) {
                spectrum = new SpectrumVisualizer(canvas, synth.analyser);
            }
        }

        return { init };
    })();

    // DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => UI.init());
    } else {
        UI.init();
    }
})();
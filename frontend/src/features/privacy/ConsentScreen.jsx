import React, { useState } from 'react'
import { ShieldCheck, Check, AlertCircle, Globe, Lock, UserCheck, HelpCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

const STATIC_TRANSLATIONS = {
  en: {
    title: 'Your Privacy in LearnAI',
    subtitle: 'Plain language promise about your data and how AI is used',
    under18Notice: 'Under 18? Ask a parent or guardian if you are unsure about any of these terms.',
    langLabel: 'Choose Language:',
    sections: [
      {
        icon: 'folder',
        heading: 'What we store',
        text: 'We save your practice scores, reading checks, and game sessions so you can pick up where you left off.',
      },
      {
        icon: 'target',
        heading: 'Why we store it',
        text: 'To show your learning streak, recommend helpful practice, and let your teacher see where the class needs extra help.',
      },
      {
        icon: 'users',
        heading: 'Who can see it',
        text: 'Only you and your teacher. Other students NEVER see your scores, and there are no public leaderboards or rankings.',
      },
      {
        icon: 'shield',
        heading: 'What the AI sees',
        text: 'The AI helper only sees your practice questions and note excerpts. It NEVER sees your real name, email, phone number, or quiz answer keys.',
      },
      {
        icon: 'trash',
        heading: 'How to delete your data',
        text: 'You can download or request deletion of all your stored data anytime in the Privacy Center. Your teacher approves it to keep school records safe.',
      },
    ],
    agreeBtn: 'I understand and agree',
    notNowBtn: 'Not now',
    notNowModalTitle: 'Why consent is needed',
    notNowModalText: 'Without your agreement, games and practice exercises will stay locked. You can still speak with your teacher to discuss alternative options.',
    goBackBtn: 'Return to Terms',
    logoutBtn: 'Log out for now',
  },
  hi: {
    title: 'LearnAI में आपकी गोपनीयता',
    subtitle: 'आपके डेटा और AI के उपयोग के बारे में सरल और स्पष्ट नियम',
    under18Notice: '18 वर्ष से कम आयु के छात्र: यदि आपको कोई संदेह है तो अपने माता-पिता या अभिभावक से पूछें।',
    langLabel: 'भाषा चुनें:',
    sections: [
      {
        heading: 'हम क्या सहेजते हैं',
        text: 'हम आपके अभ्यास अंक, नोट्स पढ़ने की प्रगति और गेम सत्र सहेजते हैं ताकि आप वहीं से जारी रख सकें।',
      },
      {
        heading: 'हम इसे क्यों सहेजते हैं',
        text: 'आपकी सीखने की प्रगति दिखाने और शिक्षक को यह समझने में मदद करने के लिए कि आपको कहाँ अतिरिक्त सहायता चाहिए।',
      },
      {
        heading: 'इसे कौन देख सकता है',
        text: 'केवल आप और आपके शिक्षक। अन्य छात्र आपके अंक कभी नहीं देख सकते, और यहाँ कोई सार्वजनिक रैंकिंग नहीं है।',
      },
      {
        heading: 'AI क्या देखता है',
        text: 'AI केवल अभ्यास प्रश्न और पाठ्य सामग्री देखता है। यह कभी भी आपका असली नाम, ईमेल या सही उत्तर नहीं देखता।',
      },
      {
        heading: 'अपना डेटा कैसे हटाएं',
        text: 'आप प्राइवेसी सेंटर से किसी भी समय अपने डेटा को हटाने का अनुरोध कर सकते हैं।',
      },
    ],
    agreeBtn: 'मैं समझता/समझती हूँ और सहमत हूँ',
    notNowBtn: 'अभी नहीं',
    notNowModalTitle: 'सहमति क्यों आवश्यक है',
    notNowModalText: 'सहमति के बिना खेल और अभ्यास लॉक रहेंगे। आप अपने शिक्षक से बात कर सकते हैं।',
    goBackBtn: 'नियमों पर वापस जाएं',
    logoutBtn: 'लॉग आउट करें',
  },
  kn: {
    title: 'LearnAI ನಲ್ಲಿ ನಿಮ್ಮ ಗೌಪ್ಯತೆ',
    subtitle: 'ನಿಮ್ಮ ಡೇಟಾ ಮತ್ತು AI ಬಳಕೆಯ ಬಗ್ಗೆ ಸರಳ ವಿವರಣೆ',
    under18Notice: '18 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನವರು: ನಿಮಗೆ ಯಾವುದೇ ಸಂದೇಹವಿದ್ದರೆ ದಯವಿಟ್ಟು ಪೋಷಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    langLabel: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ:',
    sections: [
      {
        heading: 'ನಾವು ಏನನ್ನು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ',
        text: 'ನಿಮ್ಮ ಅಭ್ಯಾಸ ಅಂಕಗಳು, ಓದುವಿಕೆಯ ಪ್ರಗತಿ ಮತ್ತು ಆಟದ ವಿವರಗಳನ್ನು ನಾವು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.',
      },
      {
        heading: 'ಏಕೆ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ',
        text: 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಪ್ರಗತಿ ತಿಳಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಶಿಕ್ಷಕರಿಗೆ ಅಗತ್ಯ ಸಹಾಯ ನೀಡಲು ಸಹಕರಿಸಲು.',
      },
      {
        heading: 'ಯಾರು ನೋಡಬಹುದು',
        text: 'ನೀವು ಮತ್ತು ನಿಮ್ಮ ಶಿಕ್ಷಕರು ಮಾತ್ರ. ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳು ನಿಮ್ಮ ಅಂಕಗಳನ್ನು ಎಂದಿಗೂ ನೋಡಲಾಗುವುದಿಲ್ಲ.',
      },
      {
        heading: 'AI ಏನನ್ನು ನೋಡುತ್ತದೆ',
        text: 'AI ಕೇವಲ ಪಠ್ಯದ ಪ್ರಶ್ನೆಗಳನ್ನು ನೋಡುತ್ತದೆ. ನಿಮ್ಮ ನಿಜವಾದ ಹೆಸರು, ಇಮೇಲ್ ಎಂದಿಗೂ AI ಗೆ ಹೋಗುವುದಿಲ್ಲ.',
      },
      {
        heading: 'ಡೇಟಾ ಅಳಿಸುವುದು ಹೇಗೆ',
        text: 'ನೀವು ಪ್ರೈವೆಸಿ ಸೆಂಟರ್ ಮೂಲಕ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಡೇಟಾ ಅಳಿಸಲು ವಿನಂತಿಸಬಹುದು.',
      },
    ],
    agreeBtn: 'ನಾನು ಒಪ್ಪುತ್ತೇನೆ',
    notNowBtn: 'ಈಗ ಬೇಡ',
    notNowModalTitle: 'ಒಪ್ಪಿಗೆ ಏಕೆ ಅಗತ್ಯ',
    notNowModalText: 'ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಆಟಗಳು ಲಾಕ್ ಆಗಿರುತ್ತವೆ. ನೀವು ಶಿಕ್ಷಕರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.',
    goBackBtn: 'ಹಿಂದಕ್ಕೆ ಹೋಗಿ',
    logoutBtn: 'ಲಾಗ್ ಔಟ್',
  },
  ta: {
    title: 'LearnAI இல் உங்கள் தனியுரிமை',
    subtitle: 'உங்கள் தரவு மற்றும் AI பயன்பாடு பற்றிய எளிய விளக்கம்',
    under18Notice: '18 வயதுக்குட்பட்டவர்கள்: ஏதேனும் சந்தேகம் இருந்தால் பெற்றோர் அல்லது காப்பாளரிடம் கேளுங்கள்.',
    langLabel: 'மொழியைத் தேர்ந்தெடுக்கவும்:',
    sections: [
      {
        heading: 'நாங்கள் எதை சேமிக்கிறோம்',
        text: 'உங்கள் பயிற்சி மதிப்பெண்கள் மற்றும் கற்றல் முன்னேற்றத்தை சேமிக்கிறோம்.',
      },
      {
        heading: 'ஏன் சேமிக்கிறோம்',
        text: 'உங்கள் கற்றல் முன்னேற்றத்தை காட்டவும் ஆசிரியருக்கு உதவவும்.',
      },
      {
        heading: 'யார் பார்க்க முடியும்',
        text: 'நீங்களும் உங்கள் ஆசிரியரும் மட்டுமே. பிற மாணவர்கள் உங்கள் மதிப்பெண்களை பார்க்க முடியாது.',
      },
      {
        heading: 'AI எதைப் பார்க்கிறது',
        text: 'AI உங்கள் கேள்விகளை மட்டுமே பார்க்கிறது. உங்கள் உண்மையான பெயர் அல்லது மின்னஞ்சலை ஒருபோதும் பார்க்காது.',
      },
      {
        heading: 'தரவை நீக்குவது எப்படி',
        text: 'தனியுரிமை மையத்தில் எப்போது வேண்டுமானாலும் தரவு நீக்க கோரிக்கை விடுக்கலாம்.',
      },
    ],
    agreeBtn: 'நான் புரிந்துகொண்டு ஒப்புக்கொள்கிறேன்',
    notNowBtn: 'இப்போது வேண்டாம்',
    notNowModalTitle: 'ஒப்புதல் ஏன் தேவை',
    notNowModalText: 'ஒப்புதல் இல்லாமல் விளையாட்டுகள் பூட்டப்பட்டிருக்கும். ஆசிரியரை அணுகலாம்.',
    goBackBtn: 'விதிமுறைகளுக்குத் திரும்பு',
    logoutBtn: 'வெளியேறு',
  },
  te: {
    title: 'LearnAI లో మీ గోప్యత',
    subtitle: 'మీ డేటా మరియు AI వినియోగం గురించి స్పష్టమైన నియమాలు',
    under18Notice: '18 ఏళ్లలోపు వారు: ఏదైనా సందేహం ఉంటే తల్లిదండ్రులను లేదా సంరక్షకులను అడగండి.',
    langLabel: 'భాషను ఎంచుకోండి:',
    sections: [
      {
        heading: 'మేము ఏమి నిల్వ చేస్తాము',
        text: 'మీ ప్రాక్టీస్ స్కోర్లు మరియు అభ్యాస పురోగతిని మేము భద్రపరుస్తాము.',
      },
      {
        heading: 'ఎందుకు నిల్వ చేస్తాము',
        text: 'మీ నేర్చుకునే పురోగతిని చూపించడానికి మరియు ఉపాధ్యాయులకు సహాయపడటానికి.',
      },
      {
        heading: 'ఎవరు చూడగలరు',
        text: 'మీరు మరియు మీ ఉపాధ్యాయులు మాత్రమే. ఇతర విద్యార్థులు మీ స్కోర్‌లను ఎప్పటికీ చూడలేరు.',
      },
      {
        heading: 'AI ఏమి చూస్తుంది',
        text: 'AI ప్రశ్నలను మాత్రమే చూస్తుంది. మీ నిజమైన పేరు లేదా ఈమెయిల్‌ను ఎప్పటికీ చూడదు.',
      },
      {
        heading: 'డేటాను ఎలా తొలగించాలి',
        text: 'ప్రైవసీ సెంటర్ ద్వారా ఎప్పుడైనా డేటా తొలగింపును అభ్యర్థించవచ్చు.',
      },
    ],
    agreeBtn: 'నేను అర్థం చేసుకున్నాను మరియు అంగీకరిస్తున్నాను',
    notNowBtn: 'ఇప్పుడు కాదు',
    notNowModalTitle: 'సమ్మతి ఎందుకు అవసరం',
    notNowModalText: 'సమ్మతి లేకుండా ఆటలు లాక్ చేయబడతాయి. మీ ఉపాధ్యాయుడిని సంప్రదించవచ్చు.',
    goBackBtn: 'నిబంధనలకు తిరిగి వెళ్ళండి',
    logoutBtn: 'లాగ్ అవుట్',
  },
}

export default function ConsentScreen({ onConsented }) {
  const [lang, setLang] = useState('en')
  const [showNotNowModal, setShowNotNowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { logout, user } = useAuthStore()

  const t = STATIC_TRANSLATIONS[lang] || STATIC_TRANSLATIONS.en

  const handleAgree = async () => {
    setSubmitting(true)
    try {
      const res = await axios.post('/api/consent', {
        version: '1.0',
        language: lang,
      })
      if (res.data.success) {
        toast.success('Privacy consent recorded. Welcome to LearnAI!')
        if (onConsented) onConsented()
      }
    } catch (err) {
      toast.error('Failed to submit consent: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full notebook-card p-6 sm:p-8 shadow-xl">
        {/* Header & Language Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-teal-wash)] border border-[var(--color-teal)] flex items-center justify-center text-[var(--color-teal)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
                {t.title}
              </h1>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Static Language Selector */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Globe className="w-4 h-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label={t.langLabel}
              className="notebook-input text-xs py-1.5 px-3 font-medium cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        {/* Under 18 Notice */}
        <div className="my-4 p-3 rounded-xl bg-[var(--color-amber-wash)] border border-[var(--color-amber)] text-xs text-[var(--color-ink)] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-[var(--color-amber)] shrink-0" aria-hidden="true" />
          <span>{t.under18Notice}</span>
        </div>

        {/* 5 Plain-Language Sections */}
        <div className="space-y-4 my-6">
          {t.sections.map((sec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-muted)] transition-colors"
            >
              <h2 className="text-sm font-bold text-[var(--color-ink)] mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-teal-wash)] text-[var(--color-teal)] text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                {sec.heading}
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed pl-7">
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setShowNotNowModal(true)}
            className="w-full sm:w-auto text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] py-2.5 px-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] transition-colors"
          >
            {t.notNowBtn}
          </button>

          <button
            onClick={handleAgree}
            disabled={submitting}
            className="w-full sm:w-auto notebook-btn-primary text-sm py-2.5 px-6"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Recording...' : t.agreeBtn}</span>
          </button>
        </div>

        {/* "Not Now" Modal */}
        {showNotNowModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="max-w-md w-full notebook-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-600">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold text-base text-[var(--color-ink)]">
                  {t.notNowModalTitle}
                </h3>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                {t.notNowModalText}
              </p>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={logout}
                  className="notebook-btn-secondary text-xs py-2 px-3 text-red-600"
                >
                  {t.logoutBtn}
                </button>
                <button
                  onClick={() => setShowNotNowModal(false)}
                  className="notebook-btn-primary text-xs py-2 px-4"
                >
                  {t.goBackBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

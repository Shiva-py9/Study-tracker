import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import axios from 'axios';

const FALLBACK_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation—it's only your imagination.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Success doesn’t just find you. You have to go out and get it.", author: "Anonymous" }
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]);

  useEffect(() => {
    const getQuote = async () => {
      try {
        const response = await axios.get('https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random'), {
          timeout: 5000
        });
        
        if (response.data && response.data.contents) {
          const quoteData = JSON.parse(response.data.contents)[0];
          if (quoteData && quoteData.q && quoteData.a) {
            setQuote({ text: quoteData.q, author: quoteData.a });
          }
        }
      } catch (error) {
        console.warn('Quote fetch failed, using fallback:', error);
      }
    };

    getQuote();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
      <Quote className="absolute -top-4 -left-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      <div className="relative z-10">
        <p className="text-lg text-white/90 italic font-medium leading-relaxed">"{quote.text}"</p>
        <p className="text-sm text-gray-500 mt-3 font-medium">— {quote.author}</p>
      </div>
    </div>
  );
}

'use client';
import { Box, Stack, TextField } from '@mui/material';
import { useState, useRef } from 'react';
import { HeroWithOrbitingCircles } from "../(components)/Background";
import { motion, AnimatePresence } from 'framer-motion';
import ChatNotification from '@/components/ui/notification';
import { StickyHeader } from "../(components)/Header";
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function Home() {
  const containerRef = useRef(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState<string>('');

  const [urlProf, setUrlProf] = useState('');

  const [scraping, setScraping] = useState(false);

  const sendMessage = async () => {
    if (!message) {
      return;
    }

    setMessage('');
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<string> => {
      if (done) {
        return result;
      }

      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });
      return reader.read().then(processText);
    };

    await reader.read().then(processText);
  };

  const scrapeURL = async (url: string) => {
    setScraping(true);
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    setScraping(false);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || 'Failed to scrape URL. Please try again.');
    }
  };


  const sendURL = async () => {
    if (!urlProf?.trim()) {
      toast.error('Please enter a valid URL.');
      return;
    }
    toast.promise(
      scrapeURL(urlProf),
      {
        loading: 'Scraping URL...',
        success: "URL scraped successfully!",
        error: (err: Error) => err.message,
      },
      {
        style: {
          minWidth: '250px',
        }
      }
    );
  };

  return (
    <main ref={containerRef} className="bg-background w-full h-full">
      <Toaster position="top-right" reverseOrder={false} />
      <StickyHeader containerRef={containerRef} />
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ position: 'relative' }}>
        <div className="flex px-4 gap-4">
          {/* Chat Box Section */}
          <div className="w-1/2 mr-20 relative">
            {/* HeroWithOrbitingCircles as the background */}
            <div className="absolute inset-0">
              <HeroWithOrbitingCircles />
            </div>
            <Stack
              direction={'column'}
              width="500px"
              border="1px solid rgba(255,255,255,.1)"
              p={2}
              spacing={3}
              sx={{
                minHeight: '580px',
                maxHeight: '580px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
                borderRadius: '16px',
                backdropFilter: 'blur(1px)', // Optional: Adds a blur effect to the background
                position: 'relative',
                top: '10px',
                zIndex: 10, // Ensures chat content stays on top
              }}
            >
              <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="90%">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, originY: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 40 }}
                    >
                      <ChatNotification
                        description={
                          msg.role === 'assistant' && !msg.content ? 'Thinking...' : msg.content
                        }
                        color={msg.role === 'assistant' ? '#00C9A7' : '#FFB800'}
                        icon={msg.role === 'assistant' ? '🤖' : '👤'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 mt-1 text-white bg-black bg-opacity-30 border border-gray-500 rounded-lg focus:border-[#00C9A7] focus:outline-none"
                  style={{
                    color: 'white', // Change the text color to white
                  }}
                />
                <Button
                  title="Send message"
                  className="bg-[#1E90FF] hover:bg-[#1A78DB] text-white font-bold py-4 px-3 rounded-lg"
                  onClick={sendMessage}
                  disabled={!message}
                >
                  <SendIcon size={20} />
                </Button>
              </Stack>
            </Stack>
          </div>

          {/* Section - Input for Web Scraping */}
          <div className="w-1/2 mt-20 mb-20 p-6 transform-gpu bg-transparent backdrop-blur-md [border:1px_solid_rgba(255,255,255,.1)] [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] rounded-lg flex flex-col justify-center items-center shadow-lg overflow-y-auto mx-auto my-auto">
            <div className="text-center mb-4">
              <h5 className="text-3xl font-semibold text-slate-100 mb-4">
                Scrape Professor Reviews
              </h5>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span>🔍</span>
                <p className="text-gray-500">
                  You can find your professor{' '}
                  <a
                    href="https://www.ratemyprofessors.com/"
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here on RateMyProfessors
                  </a>
                  .
                </p>
              </div>
              <p className="text-gray-500">Input the URL of the professor to scrape and save reviews.</p>
            </div>

            <div className="flex items-center space-x-4 w-full">
              <Input
                type="text"
                placeholder="Input URL of professor"
                value={urlProf}
                onChange={(e) => setUrlProf(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex-grow bg-slate-200 text-black placeholder-gray-700"
              />
              <Button
                onClick={sendURL}
                className="bg-[#1E90FF] hover:bg-[#1A78DB] text-white font-bold py-2 px-4 rounded-lg"
                disabled={scraping}
              >
                Send URL
              </Button>
            </div>
          </div>
        </div>
      </Box>
    </main>


  );
}

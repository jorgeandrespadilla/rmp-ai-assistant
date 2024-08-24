'use client';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef } from 'react';
import { HeroWithOrbitingCircles } from "../(components)/Background";
import { motion, AnimatePresence } from 'framer-motion';
import ChatNotification from '@/components/ui/notification';
import { StickyHeader } from "../(components)/Header";

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

  const sendMessage = async () => {
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

  return (
    <main
      ref={containerRef}
      className=" bg-black h-full w-full overflow-y-auto"
    >
      <StickyHeader containerRef={containerRef} />
      <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        position: 'relative',
      }}
    >
      <HeroWithOrbitingCircles />
      <Stack
        direction={'column'}
        width="500px"
        height="500px"
        border="1px solid black"
        p={2}
        spacing={3}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          borderRadius: '16px',
          backdropFilter: 'blur(1px)', // Optional: Adds a blur effect to the background
          position: 'absolute',
          zIndex: 1,
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="90%"
        >
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, originY: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 40 }}
              >
                <ChatNotification
                  description={msg.content}
                  color={msg.role === 'assistant' ? '#00C9A7' : '#FFB800'}
                  icon={msg.role === 'assistant' ? '🤖' : '👤'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: {
                color: 'white', // Change the text color to white
              },
            }}
            sx={{
              '& .MuiInputLabel-root': { color: 'gray' }, 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'gray', // Match the assistant's message border color
                  borderRadius: '16px', // Match the border radius of ChatNotification
                },
                '&:hover fieldset': {
                  borderColor: 'gray', // Match the assistant's message border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00C9A7', // Match the assistant's message border color
                },
                backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
                color: 'white', // Change the text color to white
              },
              '& .MuiInputBase-input': {
                padding: '10px', // Match the padding of ChatNotification
              },
            }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#00C9A7', // Match the assistant's message color
              '&:hover': {
                backgroundColor: '#00A68E', // Slightly darker shade on hover
              },
              borderRadius: '16px', // Match the border radius of ChatNotification
            }}
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
    </main>
  );
}
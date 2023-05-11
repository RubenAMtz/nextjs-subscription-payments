import { useEffect, useState } from 'react';  
import { useRouter } from 'next/router';  
import { useSessionContext } from '@supabase/auth-helpers-react';  
import { MyUserContextProvider, useUser } from '@/utils/useUser';  
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';  
import type { Database } from 'types_db';  
import React from 'react';  
// import { NextApiRequest } from 'next';  
import type { AppProps } from 'next/app';

  
export const supabase = createBrowserSupabaseClient<Database>();  
  
interface Message {  
    id: number;  
    message: string;  
    user_id: string;  
    created_at: string;  
  }  

function Chat() {  
  const router = useRouter();  
  const { user, isLoading } = useUser();  
  const [messages, setMessages] = useState<Message[]>([]);  
  const [newMessage, setNewMessage] = useState('');  
  
  useEffect(() => {  
    if (!user && !isLoading) {  
      router.push('/signin');  
    }  
  }, [user, isLoading]);  
  
  useEffect(() => {  
    fetchMessages();  
  }, []);  
  
  const fetchMessages = async () => {  
    const { data: messages, error } = await supabase  
      .from('messages')  
      .select('*')  
      .order('created_at', { ascending: false });  
  
    if (error) {  
      console.log('Error fetching messages:', error.message);  
    } else {  
    const formattedMessages = messages.map((message) => ({  
        id: message.id,  
        message: message.message,  
        user_id: message.user_id,  
        created_at: message.created_at,  
        }));  
        setMessages(formattedMessages);    
    }  
  };  
  
  const handleSubmit =  async (event: React.FormEvent<HTMLFormElement>) => {  
    event.preventDefault();  
  
    if (!newMessage.trim()) {  
      return;  
    }  
  
    const { data: message, error } = await supabase.from('messages').insert([    
        { message: newMessage, user_id: user?.id }    
      ]);         
  
    if (error) {  
      console.log('Error creating message:', error.message);  
    } else {  
        if (message) {  
            setMessages([message, ...messages]);  
            setNewMessage('');  
        }  
    }  
  };  
  
  return (  
    <div>  
      <h1>Chat</h1>  
      <form onSubmit={handleSubmit}>  
        <input  
          type="text"  
          value={newMessage}  
          onChange={(event) => setNewMessage(event.target.value)}  
        />  
        <button type="submit">Send</button>  
      </form>  
      <ul>  
        {messages.map((message) => (  
          <li key={message.id}>  
            {message.user_id}: {message.message}  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
}  
  
export default Chat;
  
// export default function MyApp({ Component, pageProps }: AppProps) {  
//   return (   
//     <MyUserContextProvider>  
//     <Component {...pageProps} />  
//     </MyUserContextProvider>  
//   );  
// }  

import { useEffect } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { BASE_URL } from '../config';

export function useVoiceUserList(setUsers: (users: string[]) => void) {
  useEffect(() => {
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/voiceUsers`, {
          withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    connection.start().catch(console.error);

    connection.on("VoiceUsersUpdated", (users: string[]) => {
      setUsers(users);
    });

    return () => {
      connection.stop();
    };
  }, []);
}

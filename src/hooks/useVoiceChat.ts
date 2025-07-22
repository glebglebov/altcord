import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { BASE_URL } from '../config';

export function useVoiceChat(
  enabled: boolean,
  username: string,
  setTalkingUsers: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
) {
  const connections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerUsernames = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const setup = async () => {
      const signalR = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/voice?username=${encodeURIComponent(username)}`, {
          withCredentials: false
        })
        .withAutomaticReconnect()
        .build();

        const createPeer = async (connectionId: string, isInitiator: boolean, remoteSdp?: string) => {
          if (connections.current.has(connectionId)) return;

          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });

          stream.getTracks().forEach(t => pc.addTrack(t, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              signalR.invoke("SendIceCandidate", connectionId, JSON.stringify(event.candidate));
            }
          };

          pc.ontrack = (event) => {
            const remoteUsername = peerUsernames.current.get(connectionId);

            const audioStream = event.streams[0];
            const audio = new Audio();
            audio.srcObject = audioStream;
            audio.play();

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(audioStream);
            const analyser = audioCtx.createAnalyser();
            source.connect(analyser);

            const data = new Uint8Array(analyser.frequencyBinCount);

            const updateVolume = () => {
              analyser.getByteFrequencyData(data);
              const avg = data.reduce((a, b) => a + b, 0) / data.length;

              const isSpeaking = avg > 10;

              if (remoteUsername) {
                setTalkingUsers((prev: Map<string, boolean>) => {
                  const updated = new Map(prev);
                  updated.set(remoteUsername, isSpeaking);
                  return updated;
                });
              }

              requestAnimationFrame(updateVolume);
            };

            updateVolume();
          };

          connections.current.set(connectionId, pc);

          if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await signalR.invoke("SendOffer", connectionId, offer.sdp, username);
          } else if (remoteSdp) {
            await pc.setRemoteDescription({ type: "offer", sdp: remoteSdp });
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await signalR.invoke("SendAnswer", connectionId, answer.sdp);
          }
        };

      await signalR.start();
      connectionRef.current = signalR;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const peers = await signalR.invoke("GetPeers");

      for (const peer of peers) {
        await createPeer(peer.connectionId, true);
      }

      // Обработка входящих offer/answer/ICE
      signalR.on("ReceiveOffer", async (fromId: string, sdp: string, fromUsername: string) => {
        peerUsernames.current.set(fromId, fromUsername);
        await createPeer(fromId, false, sdp);
      });

      signalR.on("ReceiveAnswer", async (fromId: string, sdp: string) => {
        const pc = connections.current.get(fromId);
        if (pc) await pc.setRemoteDescription({ type: "answer", sdp });
      });

      signalR.on("ReceiveIceCandidate", async (fromId: string, candidate: string) => {
        const pc = connections.current.get(fromId);
        if (pc) await pc.addIceCandidate(JSON.parse(candidate));
      });
    };

    setup();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      connections.current.forEach(pc => pc.close());
      connections.current.clear();
      connectionRef.current?.stop();
      peerUsernames.current.clear();
    };
  }, [enabled, username]);
}

import { Component, Input } from '@angular/core';
import { SocketService } from '../../shared/services/socket.service';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-video-container',
  standalone: true,
  imports: [],
  templateUrl: './video-container.component.html',
  styleUrl: './video-container.component.css',
})
export class VideoContainerComponent {
  @Input() userName!: string;
  @Input() roomName!: string;
  localStream!: MediaStream;
  caller: string[] = [];

  constructor(private socketService: SocketService) {}
  socket = this.socketService.server;

  ngOnInit() {
    this.socket.on('connect', () => {
      console.log('User Connected');
    });

    this.startMyVideo();
    this.setupSocketEvents();
  }

  private PeerConnection = (() => {
    let peerConnection: RTCPeerConnection;

    const createPeerConnection = (): RTCPeerConnection => {
      const config: RTCConfiguration = {
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],
      };
      peerConnection = new RTCPeerConnection(config);

      // add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream);
      });

      // listen to remote stream and add to peer connection
      peerConnection.ontrack = (event: RTCTrackEvent) => {
        let remoteVideo = document.getElementById(
          'remoteVideo'
        ) as HTMLVideoElement;
        remoteVideo.srcObject = event.streams[0];
      };

      // listen for ice candidate
      peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          this.socket.emit('icecandidate', event.candidate, this.roomName);
        }
      };

      return peerConnection;
    };

    return {
      getInstance: (): RTCPeerConnection => {
        if (!peerConnection) {
          peerConnection = createPeerConnection();
        }
        return peerConnection;
      },
    };
  })();

  handleEndCallBtnClick(e: Event) {
    this.socket.emit('call-ended', this.caller);
  }

  setupSocketEvents() {
    this.socket.on('joined', (allusers: Record<string, string>) => {
      console.log({ allusers });

      const createUsersHtml = () => {
        const allusersHtml = document.getElementById('allusers') as HTMLElement;
        allusersHtml.innerHTML = '';

        for (const user in allusers) {
          const li = document.createElement('li');
          li.textContent = `${user}`;
          li.className = 'user-li';

          if (this.userName != user) {
            const button = document.createElement('button');
            button.classList.add('call-btn');
            button.addEventListener('click', (e: Event) => {
              this.startCall(user);
            });
            button.innerText = 'connect';
            li.appendChild(button);
          } else {
            const button = document.createElement('button');
            button.classList.add('call-btn');
            button.innerText = 'you';
            li.appendChild(button);
          }
          allusersHtml.appendChild(li);
        }
      };

      createUsersHtml();
    });

    this.socket.on(
      'offer',
      async ({
        from,
        to,
        offer,
      }: {
        from: string;
        to: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        const pc = this.PeerConnection.getInstance();
        // set remote description
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('answer', { from, to, answer: pc.localDescription });
        this.caller = [from, to];
      }
    );

    this.socket.on(
      'answer',
      async ({
        from,
        to,
        answer,
      }: {
        from: string;
        to: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        const pc = this.PeerConnection.getInstance();
        await pc.setRemoteDescription(answer);
        const endCallBtn = document.getElementById(
          'end-call-btn'
        ) as HTMLButtonElement;
        endCallBtn.style.display = 'block';
        this.socket.emit('end-call', { from, to });
        this.caller = [from, to];
      }
    );

    this.socket.on(
      'icecandidate',
      async (candidate: RTCIceCandidateInit, room) => {
        console.log({ candidate });
        const pc = this.PeerConnection.getInstance();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    );

    this.socket.on('end-call', ({ from, to }: { from: string; to: string }) => {
      const endCallBtn = document.getElementById(
        'end-call-btn'
      ) as HTMLButtonElement;
      endCallBtn.style.display = 'block';
    });

    this.socket.on('call-ended', (caller: string[]) => {
      this.endCall();
    });
  }

  // start call method
  async startCall(user: string) {
    console.log({ user });
    const pc = this.PeerConnection.getInstance();
    const offer = await pc.createOffer();
    console.log({ offer });
    await pc.setLocalDescription(offer);
    this.socket.emit('offer', {
      from: this.userName,
      to: user,
      offer: pc.localDescription,
    });
  }

  endCall() {
    const pc = this.PeerConnection.getInstance();
    if (pc) {
      pc.close();
      const endCallBtn = document.getElementById(
        'end-call-btn'
      ) as HTMLButtonElement;
      endCallBtn.style.display = 'none';
    }
  }

  async startMyVideo() {
    console.log('startMyVideo called');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      this.localStream = stream;
      const localVideo = document.getElementById(
        'localVideo'
      ) as HTMLVideoElement;
      localVideo.srcObject = stream;
    } catch (error) {
      console.error(error);
    }
  }
}

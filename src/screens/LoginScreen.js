/* Somewhere in index.css or App.css */
.falling-note {
  position: absolute;
  top: -5%;
  color: rgba(255, 255, 255, 0.15);
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) rotate(360deg);
    opacity: 0;
  }
}

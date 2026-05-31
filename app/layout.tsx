import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal Mind Arena ♛",
  description: "Experience Chess Like Never Before — with Selen, your AI chess companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="royal-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="orb orb-4" />
          <div className="stars-layer" />
          <div className="shooting-star ss1" />
          <div className="shooting-star ss2" />
          <div className="shooting-star ss3" />
          <div className="bg-chess-piece" style={{top:"10%",left:"5%",animationDuration:"7s"}}>♛</div>
          <div className="bg-chess-piece" style={{top:"70%",left:"2%",animationDuration:"9s",animationDelay:"2s"}}>♞</div>
          <div className="bg-chess-piece" style={{top:"20%",right:"3%",animationDuration:"8s",animationDelay:"1s"}}>♜</div>
          <div className="bg-chess-piece" style={{top:"80%",right:"5%",animationDuration:"6s",animationDelay:"3s"}}>♝</div>
        </div>
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}

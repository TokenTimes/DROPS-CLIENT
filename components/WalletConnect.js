"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect } from "wagmi";
import { modal } from "../lib/wallet-config";
import { useState, useEffect } from "react";

export function WalletConnect() {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [logoScale, setLogoScale] = useState(1);

  const handleConnect = () => {
    setIsConnecting(true);
    setShowPulse(true);
    setLogoScale(1.1);

    // Simulate connection process
    setTimeout(() => {
      modal.open();
      setIsConnecting(false);
      setShowPulse(false);
      setLogoScale(1);
    }, 800);
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect your wallet?")) {
      disconnect();
    }
  };

  // Floating animation for the logo
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoScale((prev) => (prev === 1 ? 1.02 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return (
      <div
        className="wallet-header"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000,
          backgroundColor: "#2a2a2a",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #444",
          fontSize: "14px",
          color: "#ffffff",
          animation: "slideInRight 0.6s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#28a745",
              borderRadius: "50%",
              animation: "pulse 2s infinite",
            }}
          />
          <span>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            style={{
              marginLeft: "8px",
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "scale(1)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(222, 255, 78, 59)";
              e.target.style.color = "black";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#dc3545";
              e.target.style.color = "white";
              e.target.style.transform = "scale(1)";
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes logoFloat {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes textGlow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonBounce {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes connectingPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#1a1a1a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background particles */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "2px",
                height: "2px",
                backgroundColor: "rgba(222, 255, 78, 0.3)",
                borderRadius: "50%",
                animation: `float ${3 + (i % 3)}s infinite linear`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div
          className="wallet-connect-container"
          style={{
            backgroundColor: "#2a2a2a",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            maxWidth: "320px",
            width: "100%",
            border: "1px solid #444",
            animation: "fadeInUp 0.8s ease-out",
            position: "relative",
          }}
        >
          {/* Animated connection pulse ring */}
          {showPulse && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                border: "2px solid rgba(222, 255, 78, 0.6)",
                transform: "translate(-50%, -50%)",
                animation: "pulseRing 0.8s ease-out",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Logo and Title - Larger than header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              gap: "16px",
              animation: "logoFloat 0.6s ease-out 0.2s both",
            }}
          >
            <img
              src="/drops_logo.png"
              alt="DROPS"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                transform: `scale(${logoScale})`,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: showPulse
                  ? "drop-shadow(0 0 20px rgba(222, 255, 78, 0.8))"
                  : "none",
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: "48px",
                fontWeight: "600",
                color: "rgba(222, 255, 78, 59)",
                fontFamily: "IBM Plex Mono, Courier New, monospace",
                animation: "textGlow 0.6s ease-out 0.4s both",
                textShadow: showPulse
                  ? "0 0 20px rgba(222, 255, 78, 0.6)"
                  : "none",
                transition: "text-shadow 0.3s ease",
              }}
            >
              DROPS
            </h1>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            style={{
              width: "100%",
              padding: "16px 24px",
              fontSize: "18px",
              fontWeight: "600",
              backgroundColor: isConnecting ? "#666" : "rgba(222, 255, 78, 59)",
              color: isConnecting ? "#999" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isConnecting ? "not-allowed" : "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "scale(1)",
              animation: "buttonBounce 0.6s ease-out 0.6s both",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOut={(e) => {
              if (!isConnecting) {
                e.target.style.backgroundColor = "rgba(222, 255, 78, 59)";
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
              }
            }}
            onMouseDown={(e) => {
              if (!isConnecting) {
                e.target.style.transform = "scale(0.98)";
              }
            }}
            onMouseUp={(e) => {
              if (!isConnecting) {
                e.target.style.transform = "scale(1.02)";
              }
            }}
          >
            {/* Button ripple effect */}
            {isConnecting && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "rgba(222, 255, 78, 0.6)",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "ripple 0.8s infinite",
                }}
              />
            )}

            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>

          {/* Connection status indicator */}
          {isConnecting && (
            <div
              style={{
                marginTop: "16px",
                fontSize: "14px",
                color: "rgba(222, 255, 78, 0.8)",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "rgba(222, 255, 78, 0.8)",
                    borderRadius: "50%",
                    animation: "connectingPulse 1.5s infinite",
                  }}
                />
                Opening wallet connection...
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

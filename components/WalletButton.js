"use client";

export function WalletButton() {
  const handleConnect = () => {
    // Create a wallet connect button using the appkit
    const button = document.createElement("appkit-button");
    button.click();
  };

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
      <appkit-button />
    </div>
  );
}

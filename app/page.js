"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { WalletConnect } from "../components/WalletConnect";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://copypools-production.up.railway.app";

// USDT contract address on Arbitrum
const USDT_ADDRESS_ARBITRUM = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

export default function HomePage() {
  const { isConnected, address } = useAppKitAccount();

  // Fetch USDT balance on Arbitrum
  const {
    data: usdtBalance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useBalance({
    address: address,
    token: USDT_ADDRESS_ARBITRUM,
    chainId: 42161, // Arbitrum One
    enabled: !!address, // Only fetch when address is available
  });

  // Debug logging
  useEffect(() => {
    console.log("Balance fetch debug:", {
      address,
      usdtBalance,
      balanceLoading,
      balanceError,
      isConnected,
    });
  }, [address, usdtBalance, balanceLoading, balanceError, isConnected]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [minLiquidity, setMinLiquidity] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [selectedMarkets, setSelectedMarkets] = useState(new Set());
  const [displayLimit, setDisplayLimit] = useState(50);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Outcome allocations for each market - stores percentages for each outcome
  const [outcomeAllocations, setOutcomeAllocations] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("outcome-allocations");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Separate memory for each tab's selections
  const [polymarketSelections, setPolymarketSelections] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("polymarket-selections");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [bet365Selections, setBet365Selections] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bet365-selections");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [countdown, setCountdown] = useState(3600); // 60 minutes = 3600 seconds
  const [activeTab, setActiveTab] = useState("polymarket");
  const [sport, setSport] = useState("soccer_epl");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [regions, setRegions] = useState("us,uk,eu,au");
  const [previousMarkets, setPreviousMarkets] = useState(new Set());
  const [newMarkets, setNewMarkets] = useState(new Set());

  // Store all data from both tabs for cross-tab access
  const [allPolymarketData, setAllPolymarketData] = useState([]);
  const [allBet365Data, setAllBet365Data] = useState([]);

  // Fetch data based on active tab
  const fetchData = async (isRefresh = false) => {
    setLoading(true);
    setError("");
    try {
      let url;
      if (activeTab === "polymarket") {
        url = new URL(`${API_BASE}/api/polymarket`);
        url.searchParams.set("active", String(onlyOpen));
        url.searchParams.set("limit", "1000");
      } else {
        url = new URL(`${API_BASE}/api/bet365`);
        url.searchParams.set("sport", sport);
        url.searchParams.set("regions", regions);
        url.searchParams.set("markets", "h2h");
        url.searchParams.set("limit", "500");
      }

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);

      const newData = json.markets || [];
      const currentMarketIds = new Set(newData.map((m) => m.market_id));

      if (isRefresh && previousMarkets.size > 0) {
        // Find truly new markets that weren't in the previous fetch
        const discoveredNew = new Set();
        newData.forEach((market) => {
          if (!previousMarkets.has(market.market_id)) {
            discoveredNew.add(market.market_id);
          }
        });
        setNewMarkets(discoveredNew);

        // Clear new market indicators after 60 seconds
        if (discoveredNew.size > 0) {
          setTimeout(() => {
            setNewMarkets(new Set());
          }, 60000);
        }
      }

      setPreviousMarkets(currentMarketIds);
      setRows(newData);

      // Store data for cross-tab access
      if (activeTab === "polymarket") {
        setAllPolymarketData(newData);
      } else {
        setAllBet365Data(newData);
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, onlyOpen, sport, regions]);

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Sync selectedMarkets with tab-specific memory
  useEffect(() => {
    if (activeTab === "polymarket") {
      setSelectedMarkets(polymarketSelections);
    } else {
      setSelectedMarkets(bet365Selections);
    }
  }, [activeTab, polymarketSelections, bet365Selections]);

  // Save selections to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "polymarket-selections",
        JSON.stringify([...polymarketSelections])
      );
    }
  }, [polymarketSelections]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "bet365-selections",
        JSON.stringify([...bet365Selections])
      );
    }
  }, [bet365Selections]);

  // Save outcome allocations to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "outcome-allocations",
        JSON.stringify(outcomeAllocations)
      );
    }
  }, [outcomeAllocations]);

  // Auto-distribute allocations when investment amount changes
  useEffect(() => {
    if (
      investmentAmount &&
      investmentAmount !== "0" &&
      investmentAmount !== ""
    ) {
      // Get all selected markets from both tabs
      const allSelectedMarkets = [
        ...Array.from(polymarketSelections).map((id) => ({
          id,
          data: allPolymarketData,
        })),
        ...Array.from(bet365Selections).map((id) => ({
          id,
          data: allBet365Data,
        })),
      ];

      // Auto-distribute for markets that have no allocations or incomplete allocations
      allSelectedMarkets.forEach(({ id, data }) => {
        const market = data.find((m) => m.market_id === id);
        if (market && market.outcomes) {
          const currentTotal = getTotalAllocation(id);
          // Auto-distribute if no allocations exist or total is not 100%
          if (currentTotal === 0) {
            autoDistributeAllocations(id, market.outcomes);
          }
        }
      });
    }
  }, [
    investmentAmount,
    polymarketSelections,
    bet365Selections,
    allPolymarketData,
    allBet365Data,
  ]);

  // Sorting function
  const handleSort = (column) => {
    console.log("Sorting by:", column, "Current:", sortBy, sortOrder);
    if (sortBy === column) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      console.log("Changed order to:", newOrder);
    } else {
      setSortBy(column);
      setSortOrder("desc");
      console.log("Changed column to:", column, "order: desc");
    }
  };

  // Auto-refresh with countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return 3600; // Reset countdown to 60 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, onlyOpen, sport, regions]);

  // Outcome allocation functions
  const updateOutcomeAllocation = (marketId, outcomeIndex, percentage) => {
    setOutcomeAllocations((prev) => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        [outcomeIndex]: percentage,
      },
    }));
  };

  // Smart auto-balancing allocation update
  const updateOutcomeAllocationWithBalance = (
    marketId,
    outcomeIndex,
    newPercentage,
    totalOutcomes
  ) => {
    const currentAllocations = outcomeAllocations[marketId] || {};
    const newAllocations = { ...currentAllocations };

    // Set the new percentage for the changed outcome
    newAllocations[outcomeIndex] = Math.max(0, Math.min(100, newPercentage));

    // Calculate remaining percentage to distribute
    const remainingPercentage = 100 - newAllocations[outcomeIndex];

    // Get all other outcome indices
    const otherIndices = Array.from(
      { length: totalOutcomes },
      (_, i) => i
    ).filter((i) => i !== outcomeIndex);

    if (otherIndices.length > 0 && remainingPercentage >= 0) {
      // Calculate current total of other outcomes
      const otherTotal = otherIndices.reduce(
        (sum, i) => sum + (currentAllocations[i] || 0),
        0
      );

      if (otherTotal > 0) {
        // Proportionally redistribute the remaining percentage
        otherIndices.forEach((i) => {
          const currentValue = currentAllocations[i] || 0;
          const proportion = currentValue / otherTotal;
          newAllocations[i] = Math.max(0, remainingPercentage * proportion);
        });
      } else {
        // If other outcomes were 0, distribute equally
        const equalShare = remainingPercentage / otherIndices.length;
        otherIndices.forEach((i) => {
          newAllocations[i] = equalShare;
        });
      }
    }

    // Ensure total is exactly 100% (handle floating point precision)
    const actualTotal = Object.values(newAllocations).reduce(
      (sum, val) => sum + val,
      0
    );
    if (actualTotal !== 100 && actualTotal > 0) {
      const adjustment = 100 / actualTotal;
      Object.keys(newAllocations).forEach((key) => {
        newAllocations[key] *= adjustment;
      });
    }

    setOutcomeAllocations((prev) => ({
      ...prev,
      [marketId]: newAllocations,
    }));
  };

  // Reset allocations to match market odds
  const resetAllocationsToOdds = (marketId, outcomes) => {
    if (!outcomes || outcomes.length === 0) return;

    // Check if all outcomes have valid odds
    const hasValidOdds = outcomes.every(
      (outcome) => outcome.implied_prob != null && outcome.implied_prob > 0
    );

    if (!hasValidOdds) return;

    // Calculate total probability (should be close to 1, but normalize just in case)
    const totalProb = outcomes.reduce(
      (sum, outcome) => sum + (outcome.implied_prob || 0),
      0
    );

    if (totalProb <= 0) return;

    // Set allocations based on normalized odds
    const newAllocations = {};
    outcomes.forEach((outcome, index) => {
      const normalizedProb = (outcome.implied_prob || 0) / totalProb;
      newAllocations[index] = normalizedProb * 100;
    });

    setOutcomeAllocations((prev) => ({
      ...prev,
      [marketId]: newAllocations,
    }));
  };

  // Check if outcomes have valid odds for display
  const hasValidOddsForDisplay = (outcomes) => {
    return (
      outcomes &&
      outcomes.length > 0 &&
      outcomes.some(
        (outcome) => outcome.implied_prob != null && outcome.implied_prob > 0
      )
    );
  };

  const getOutcomeAllocation = (marketId, outcomeIndex) => {
    return outcomeAllocations[marketId]?.[outcomeIndex] || 0;
  };

  const getTotalAllocation = (marketId) => {
    const allocations = outcomeAllocations[marketId] || {};
    return Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  };

  const normalizeAllocations = (marketId, outcomes) => {
    const total = getTotalAllocation(marketId);
    if (total === 0) {
      // Equal distribution if no allocations set
      const equalShare = 100 / outcomes.length;
      const newAllocations = {};
      outcomes.forEach((_, index) => {
        newAllocations[index] = equalShare;
      });
      setOutcomeAllocations((prev) => ({
        ...prev,
        [marketId]: newAllocations,
      }));
      return equalShare;
    }
    return total;
  };

  // Auto-distribute allocations equally for a market
  const autoDistributeAllocations = (marketId, outcomes) => {
    if (!outcomes || outcomes.length === 0) return;

    const equalShare = 100 / outcomes.length;
    const newAllocations = {};
    outcomes.forEach((_, index) => {
      newAllocations[index] = equalShare;
    });

    setOutcomeAllocations((prev) => ({
      ...prev,
      [marketId]: newAllocations,
    }));
  };

  // Investment validation
  const investmentValue = parseFloat(investmentAmount) || 0;
  const availableBalance = usdtBalance ? parseFloat(usdtBalance.formatted) : 0;
  const totalQuestions = polymarketSelections.size + bet365Selections.size;
  const investmentPerQuestion =
    totalQuestions > 0 ? investmentValue / totalQuestions : 0;

  const investmentError = useMemo(() => {
    if (!investmentAmount) return "";
    if (investmentValue > availableBalance)
      return "Investment amount exceeds available balance";
    if (totalQuestions > 0 && investmentPerQuestion < 10)
      return "Investment per question must be at least $10";
    return "";
  }, [
    investmentAmount,
    investmentValue,
    availableBalance,
    totalQuestions,
    investmentPerQuestion,
  ]);

  const isExportDisabled = useMemo(() => {
    const hasSelections = polymarketSelections.size + bet365Selections.size > 0;
    const hasValidInvestment =
      investmentAmount && investmentAmount !== "0" && investmentAmount !== "";
    const hasNoErrors = !investmentError;
    return !hasSelections || !hasValidInvestment || !hasNoErrors || isExporting;
  }, [
    polymarketSelections.size,
    bet365Selections.size,
    investmentAmount,
    investmentError,
    isExporting,
  ]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let filtered = rows.filter((m) => {
      const matchesQuery =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q);

      const matchesLiquidity =
        !minLiquidity || Number(m.liquidity || 0) >= Number(minLiquidity);

      return matchesQuery && matchesLiquidity;
    });

    // Apply sorting
    console.log("Applying sort - sortBy:", sortBy, "sortOrder:", sortOrder);
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "liquidity":
          aVal = Number(a.liquidity || 0);
          bVal = Number(b.liquidity || 0);
          break;
        case "date":
          aVal = new Date(
            a.end_date || a.commence_time || "1970-01-01"
          ).getTime();
          bVal = new Date(
            b.end_date || b.commence_time || "1970-01-01"
          ).getTime();
          break;
        case "title":
          aVal = (a.title || "").toLowerCase();
          bVal = (b.title || "").toLowerCase();
          break;
        case "volume":
          aVal = Number(a.volume || 0);
          bVal = Number(b.volume || 0);
          break;
        default:
          // Default sort by date
          aVal = new Date(
            a.end_date || a.commence_time || "1970-01-01"
          ).getTime();
          bVal = new Date(
            b.end_date || b.commence_time || "1970-01-01"
          ).getTime();
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
    });

    // Apply display limit
    return filtered.slice(0, displayLimit);
  }, [rows, query, minLiquidity, displayLimit, sortBy, sortOrder]);

  // JSON preview data - includes selections from both tabs
  const jsonPreviewData = useMemo(() => {
    const allSelectedData = [];

    // Add selected Polymarket data
    const polymarketSelected = allPolymarketData.filter((m) =>
      polymarketSelections.has(m.market_id)
    );
    allSelectedData.push(...polymarketSelected);

    // Add selected Bet365 data
    const bet365Selected = allBet365Data.filter((m) =>
      bet365Selections.has(m.market_id)
    );
    allSelectedData.push(...bet365Selected);

    const questions = allSelectedData.map((market) => {
      const baseInvestment =
        totalQuestions > 0 && investmentValue > 0 ? investmentPerQuestion : 0;
      const allocations = outcomeAllocations[market.market_id] || {};

      // Create allocation breakdown for each outcome
      const outcomeAllocationBreakdown =
        market.outcomes?.map((outcome, index) => ({
          outcome: outcome.name,
          percentage: allocations[index] || 0,
          amount: baseInvestment * ((allocations[index] || 0) / 100),
        })) || [];

      return {
        question: market.title,
        options: market.outcomes?.map((outcome) => outcome.name) || [],
        invested: baseInvestment,
        outcome_allocations: outcomeAllocationBreakdown,
        total_allocation_percentage: Object.values(allocations).reduce(
          (sum, val) => sum + (val || 0),
          0
        ),
      };
    });

    // Calculate USDT balance with better error handling
    let usdtBalanceValue = 0;
    if (balanceLoading) {
      usdtBalanceValue = "loading...";
    } else if (balanceError) {
      usdtBalanceValue = `error: ${balanceError.message}`;
    } else if (usdtBalance) {
      usdtBalanceValue = parseFloat(usdtBalance.formatted);
    }

    return {
      questions: questions,
      funding_wallet: address || null,
      remaining_usdt_balance: usdtBalanceValue,
      total_invested_usdt: investmentValue || 0,
    };
  }, [
    allPolymarketData,
    allBet365Data,
    polymarketSelections,
    bet365Selections,
    address,
    usdtBalance,
    balanceLoading,
    balanceError,
    investmentValue,
    totalQuestions,
    investmentPerQuestion,
    outcomeAllocations,
  ]);

  // Selection handlers
  const handleSelectAll = (checked) => {
    const newSelected = checked
      ? new Set(filtered.map((m) => m.market_id))
      : new Set();
    setSelectedMarkets(newSelected);

    // Update the appropriate tab's memory
    if (activeTab === "polymarket") {
      setPolymarketSelections(newSelected);
    } else {
      setBet365Selections(newSelected);
    }
  };

  const handleSelectMarket = (marketId, checked) => {
    // Update the current tab's selections
    const newSelected = new Set(selectedMarkets);
    if (checked) {
      newSelected.add(marketId);
    } else {
      newSelected.delete(marketId);
    }
    setSelectedMarkets(newSelected);

    // Update the appropriate tab's memory
    if (activeTab === "polymarket") {
      setPolymarketSelections(newSelected);
    } else {
      setBet365Selections(newSelected);
    }

    // Auto-distribute allocations equally when a market is selected
    if (checked) {
      // Find the market data to get outcomes
      const currentData =
        activeTab === "polymarket" ? allPolymarketData : allBet365Data;
      const market = currentData.find((m) => m.market_id === marketId);

      if (market && market.outcomes) {
        // Only auto-distribute if there are no existing allocations or if investment amount is set
        const currentTotal = getTotalAllocation(marketId);
        if (currentTotal === 0 || investmentAmount) {
          autoDistributeAllocations(marketId, market.outcomes);
        }
      }
    } else {
      // Reset allocations when unselecting a market
      setOutcomeAllocations((prev) => {
        const newAllocations = { ...prev };
        delete newAllocations[marketId];
        return newAllocations;
      });
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(jsonPreviewData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected-markets-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export to Rain
  const exportToRain = async () => {
    // Validation checks
    if (polymarketSelections.size + bet365Selections.size === 0) return;
    if (
      !investmentAmount ||
      investmentAmount === "0" ||
      investmentAmount === ""
    )
      return;
    if (investmentError) return;

    const totalQuestions = polymarketSelections.size + bet365Selections.size;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Mock processing - 1 second per selected question with progress
      for (let i = 0; i < totalQuestions; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setExportProgress(((i + 1) / totalQuestions) * 100);
      }

      // Log to console for now (could be extended to actual Rain integration)
      console.log("Exported to Rain:", jsonPreviewData);

      // Show success toast
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Utility functions
  const fmtNumber = (n) => {
    if (!n) return "—";
    return Number(n).toLocaleString();
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  // Table components
  function Th({ children, style = {}, onClick, ...props }) {
    return (
      <th
        style={{
          textAlign: "left",
          fontWeight: 600,
          fontSize: 14,
          padding: "10px 8px",
          background: "#fafafa",
          ...style,
        }}
        onClick={onClick}
        {...props}
      >
        {children}
      </th>
    );
  }

  function Td({ children, style = {} }) {
    return (
      <td
        style={{
          padding: "8px",
          borderBottom: "1px solid #eee",
          fontSize: 13,
          ...style,
        }}
      >
        {children}
      </td>
    );
  }

  // Show wallet connect screen if not connected
  if (!isConnected) {
    return <WalletConnect />;
  }

  return (
    <>
      <WalletConnect />
      <div
        className="main-container"
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
          padding: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* App Header with Logo */}
        <div
          className="app-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/drops_logo.png"
            alt="DROPS"
            className="app-logo"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 700,
              color: "rgba(222, 255, 78, 59)",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            DROPS
          </h1>
        </div>
        {/* Tab Interface */}
        <div style={{ marginBottom: 20, marginTop: 25 }}>
          <div style={{ display: "flex" }}>
            <button
              className={`tab-button ${
                activeTab === "polymarket" ? "active" : ""
              }`}
              onClick={() => setActiveTab("polymarket")}
              style={{
                flex: 1,
                padding: "12px 24px",
                border: "none",
                backgroundColor:
                  activeTab === "polymarket"
                    ? "rgba(222, 255, 78, 59)"
                    : "#f8f9fa",
                color: activeTab === "polymarket" ? "black" : "#495057",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 6,
              }}
            >
              Polymarket
            </button>
            <button
              className={`tab-button ${activeTab === "bet365" ? "active" : ""}`}
              onClick={() => setActiveTab("bet365")}
              style={{
                flex: 1,
                padding: "12px 24px",
                border: "none",
                backgroundColor:
                  activeTab === "bet365" ? "rgba(222, 255, 78, 59)" : "#f8f9fa",
                color: activeTab === "bet365" ? "black" : "#495057",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 6,
              }}
            >
              Bet365
            </button>
          </div>
        </div>{" "}
        {/* Investment controls */}
        <div
          className="investment-box"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            padding: 12,
            backgroundColor: "#2a2a2a",
            borderRadius: 4,
            border: investmentError ? "1px solid #dc3545" : "1px solid #444",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}
          >
            Invest USDT:
          </span>
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={{
              width: "100px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: investmentError ? "1px solid #dc3545" : "1px solid #555",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              fontSize: "14px",
            }}
          />
          <span style={{ color: "#888", fontSize: "12px" }}>
            Balance: ${availableBalance.toFixed(2)}
          </span>
          {totalQuestions > 0 && investmentValue > 0 && (
            <span style={{ color: "#888", fontSize: "12px" }}>
              ${investmentPerQuestion.toFixed(2)}/question
            </span>
          )}
          <span style={{ color: "#ffffff", fontSize: "12px" }}>
            ({polymarketSelections.size + bet365Selections.size} selected)
          </span>
          {investmentError && (
            <span
              style={{ color: "#dc3545", fontSize: "12px", fontWeight: "500" }}
            >
              {investmentError}
            </span>
          )}
        </div>
        <div
          className="controls-section"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <input
            className="control-input"
            type="text"
            placeholder="Search title or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 8, minWidth: 280 }}
          />
          <input
            className="control-input"
            type="number"
            min={0}
            placeholder="Min liquidity"
            value={minLiquidity}
            onChange={(e) => setMinLiquidity(e.target.value)}
            style={{ padding: 8, width: 160 }}
          />
          <select
            className="control-input"
            value={displayLimit}
            onChange={(e) => setDisplayLimit(Number(e.target.value))}
            style={{ padding: 8, width: 120 }}
          >
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
            <option value={100}>Show 100</option>
            <option value={200}>Show 200</option>
            <option value={500}>Show 500</option>
          </select>

          {/* Bet365-specific controls */}
          {activeTab === "bet365" && (
            <>
              <select
                className="control-input"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                style={{ padding: 8, width: 180 }}
              >
                <option value="soccer_epl">Premier League</option>
                <option value="soccer_uefa_champs_league">
                  Champions League
                </option>
                <option value="basketball_nba">NBA</option>
                <option value="mma_mixed_martial_arts">MMA</option>
                <option value="tennis_atp">ATP Tennis</option>
              </select>
              <input
                className="control-input"
                type="text"
                value={regions}
                onChange={(e) => setRegions(e.target.value)}
                style={{ padding: 8, width: 120 }}
                placeholder="uk,eu,us,au"
              />
            </>
          )}
        </div>
        {loading && <p className="loading">Loading…</p>}
        {error && (
          <p className="error" style={{ color: "crimson" }}>
            {error}
          </p>
        )}
        {!loading && !error && (
          <div
            className="main-content"
            style={{ display: "flex", gap: 16, height: "60vh" }}
          >
            {/* Main table - 70% width */}
            <div
              className="table-container"
              style={{
                flex: "0 0 70%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                className="table-wrapper"
                style={{
                  height: "100%",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fafafa",
                      zIndex: 100,
                    }}
                  >
                    <tr>
                      <Th
                        className="select-column"
                        style={{ width: 50, textAlign: "center" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedMarkets.size === filtered.length &&
                            filtered.length > 0
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            cursor: "pointer",
                            transform: "scale(1.2)",
                          }}
                          title={
                            selectedMarkets.size === filtered.length &&
                            filtered.length > 0
                              ? "Deselect All"
                              : "Select All"
                          }
                        />
                      </Th>
                      <Th
                        className="date-column clickable"
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "background-color 0.2s",
                          "&:hover": { backgroundColor: "#e9ecef" },
                        }}
                        onClick={() => handleSort("date")}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#e9ecef")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#fafafa")
                        }
                      >
                        Date{" "}
                        <span
                          className="sort-arrow"
                          style={{
                            color: sortBy === "date" ? "#007bff" : "#6c757d",
                          }}
                        >
                          {sortBy === "date"
                            ? sortOrder === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </Th>
                      <Th className="title-column">Title</Th>
                      {activeTab === "polymarket" && (
                        <Th
                          className="liquidity-column clickable"
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background-color 0.2s",
                          }}
                          onClick={() => handleSort("liquidity")}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#e9ecef")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "#fafafa")
                          }
                        >
                          Liquidity{" "}
                          <span
                            className="sort-arrow"
                            style={{
                              color:
                                sortBy === "liquidity" ? "#007bff" : "#6c757d",
                            }}
                          >
                            {sortBy === "liquidity"
                              ? sortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : "↕"}
                          </span>
                        </Th>
                      )}
                      <Th
                        className="outcomes-column"
                        style={{ minWidth: "300px" }}
                      >
                        Outcome Allocation
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr
                        key={m.market_id}
                        style={{
                          backgroundColor: newMarkets.has(m.market_id)
                            ? "#d4edda"
                            : "transparent",
                        }}
                      >
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedMarkets.has(m.market_id)}
                            onChange={(e) =>
                              handleSelectMarket(m.market_id, e.target.checked)
                            }
                          />
                        </Td>
                        <Td>{fmtDate(m.end_date || m.commence_time)}</Td>
                        <Td>{m.title}</Td>
                        {activeTab === "polymarket" && (
                          <Td>{fmtNumber(m.liquidity) || "—"}</Td>
                        )}
                        <Td style={{ padding: "8px" }}>
                          <div style={{ minWidth: "280px" }}>
                            {selectedMarkets.has(m.market_id) ? (
                              <>
                                {(m.outcomes || []).map((outcome, index) => {
                                  const currentAllocation =
                                    getOutcomeAllocation(m.market_id, index);
                                  const totalOutcomes = m.outcomes.length;

                                  return (
                                    <div
                                      key={index}
                                      style={{
                                        marginBottom: "8px",
                                        padding: "6px",
                                        border: "1px solid #555",
                                        borderRadius: "4px",
                                        backgroundColor: "#2a2a2a",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            maxWidth: "120px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              color: "#ffffff",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                            title={outcome.name}
                                          >
                                            {outcome.name}
                                          </span>
                                          {outcome.implied_prob != null &&
                                            outcome.implied_prob > 0 && (
                                              <span
                                                style={{
                                                  fontSize: "10px",
                                                  color: "#888888",
                                                  fontStyle: "italic",
                                                }}
                                              >
                                                Odds:{" "}
                                                {(
                                                  outcome.implied_prob * 100
                                                ).toFixed(1)}
                                                %
                                              </span>
                                            )}
                                        </div>
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            color: "#cccccc",
                                            minWidth: "50px",
                                            textAlign: "right",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {currentAllocation.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "6px",
                                        }}
                                      >
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          value={currentAllocation}
                                          onChange={(e) => {
                                            const newValue = parseFloat(
                                              e.target.value
                                            );
                                            updateOutcomeAllocationWithBalance(
                                              m.market_id,
                                              index,
                                              newValue,
                                              totalOutcomes
                                            );
                                          }}
                                          style={{
                                            flex: 1,
                                            height: "4px",
                                            borderRadius: "2px",
                                            background: `linear-gradient(to right, rgba(220, 236, 78, 0.9) 0%, rgba(220, 236, 78, 0.9) ${currentAllocation}%, #333 ${currentAllocation}%, #333 100%)`,
                                            outline: "none",
                                            cursor: "pointer",
                                            WebkitAppearance: "none",
                                            appearance: "none",
                                          }}
                                        />
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          value={currentAllocation.toFixed(1)}
                                          onChange={(e) => {
                                            const newValue = Math.max(
                                              0,
                                              Math.min(
                                                100,
                                                parseFloat(e.target.value) || 0
                                              )
                                            );
                                            updateOutcomeAllocationWithBalance(
                                              m.market_id,
                                              index,
                                              newValue,
                                              totalOutcomes
                                            );
                                          }}
                                          style={{
                                            width: "55px",
                                            padding: "3px 6px",
                                            fontSize: "11px",
                                            border: "1px solid #555",
                                            borderRadius: "4px",
                                            textAlign: "center",
                                            backgroundColor: "#1a1a1a",
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}

                                {hasValidOddsForDisplay(m.outcomes) && (
                                  <div
                                    style={{
                                      marginTop: "8px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        resetAllocationsToOdds(
                                          m.market_id,
                                          m.outcomes
                                        )
                                      }
                                      style={{
                                        padding: "4px 12px",
                                        fontSize: "10px",
                                        fontWeight: "500",
                                        backgroundColor:
                                          "rgba(220, 236, 78, 0.1)",
                                        color: "rgba(220, 236, 78, 1)",
                                        border:
                                          "1px solid rgba(220, 236, 78, 0.3)",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                      }}
                                      onMouseOver={(e) => {
                                        e.target.style.backgroundColor =
                                          "rgba(220, 236, 78, 0.2)";
                                        e.target.style.borderColor =
                                          "rgba(220, 236, 78, 0.5)";
                                      }}
                                      onMouseOut={(e) => {
                                        e.target.style.backgroundColor =
                                          "rgba(220, 236, 78, 0.1)";
                                        e.target.style.borderColor =
                                          "rgba(220, 236, 78, 0.3)";
                                      }}
                                    >
                                      Reset to Odds
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              // Show outcome names with odds for unselected questions
                              <div>
                                {(m.outcomes || [])
                                  .slice(0, 3)
                                  .map((outcome, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        display: "inline-block",
                                        marginRight: 8,
                                        fontSize: "12px",
                                        color: "#ffffff",
                                      }}
                                    >
                                      {outcome.name}:{" "}
                                      {outcome.implied_prob != null
                                        ? (outcome.implied_prob * 100).toFixed(
                                            1
                                          ) + "%"
                                        : "—"}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* JSON Preview - 30% width */}
            <div
              className="json-preview-container json-container"
              style={{
                flex: "0 0 28.5%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                className="json-preview"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  backgroundColor: "#f8f9fa",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="json-header"
                  style={{
                    padding: 12,
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#e9ecef",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  JSON Preview ({jsonPreviewData.questions.length} selected)
                </div>
                <div
                  className="json-content"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 12,
                  }}
                >
                  <pre
                    style={{
                      fontSize: 11,
                      lineHeight: 1.4,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily:
                        "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                    }}
                  >
                    {JSON.stringify(jsonPreviewData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Export to Rain Button - Centered below table and JSON preview */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <button
              className="export-button"
              onClick={exportToRain}
              disabled={isExportDisabled}
              style={{
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: "600",
                backgroundColor: isExportDisabled
                  ? "#666666"
                  : "rgba(222, 255, 78, 59)",
                color: isExportDisabled ? "#999999" : "black",
                border: "none",
                borderRadius: 8,
                cursor: isExportDisabled ? "not-allowed" : "pointer",
                minWidth: "200px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
                opacity: isExportDisabled ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                if (!isExportDisabled) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseOut={(e) => {
                if (!isExportDisabled) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {isExporting && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: "4px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    width: `${exportProgress}%`,
                    transition: "width 0.3s ease",
                    borderRadius: "0 0 8px 8px",
                  }}
                />
              )}
              {isExporting && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid transparent",
                    borderTop: "2px solid black",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
              {isExporting
                ? `Exporting ${totalQuestions} drops ...`
                : "Make it Rain"}
            </button>
          </div>
        )}
        {/* Success Toast */}
        {showToast && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              backgroundColor: "#28a745",
              color: "white",
              padding: "16px 24px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              zIndex: 10002,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: "500",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            ✅ Successfully exported {totalQuestions} questions to Rain!
          </div>
        )}
        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes slideIn {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </>
  );
}

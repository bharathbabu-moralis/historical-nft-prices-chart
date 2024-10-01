import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [chain, setChain] = useState("eth");
  const [duration, setDuration] = useState("7d");
  const [metadata, setMetadata] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  const fetchMetadata = async () => {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/nft/${contractAddress}/metadata?chain=${chain}`,
        {
          method: "GET",
          headers: {
            "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY,
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/nft/${contractAddress}/floor-price/historical?chain=${chain}&interval=${duration}`,
        {
          method: "GET",
          headers: {
            "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY,
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      setHistoricalData(data.result.reverse()); // Reverse the order of the historical data
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  const handleSearch = () => {
    fetchMetadata();
    fetchHistoricalData();
  };

  const chartData = {
    labels: historicalData?.map((data) =>
      new Date(data.timestamp).toLocaleString()
    ),
    datasets: [
      {
        label: "NFT Floor Price (ETH)",
        data: historicalData?.map((data) => data.floor_price),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        pointBackgroundColor: "#388E3C",
        pointBorderColor: "#4CAF50",
        fill: true,
        tension: 0.4, // Curves the lines
      },
    ],
  };

  return (
    <div className="container">
      <h2 className="header">NFT Floor Price Tracker</h2>
      <div className="formContainer">
        <label className="label">Contract Address:</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Enter Contract Address"
          className="input"
        />
      </div>
      <div className="formContainer">
        <label className="label">Chain:</label>
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="select"
        >
          <option value="eth">Ethereum</option>
          <option value="base">Base</option>
        </select>
      </div>
      <div className="formContainer">
        <label className="label">Chart Duration:</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="select"
        >
          <option value="1d">1 Day</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
          <option value="60d">60 Days</option>
          <option value="90d">90 Days</option>
          <option value="1y">1 Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <button onClick={handleSearch} className="button">
        Search
      </button>

      {metadata && (
        <div className="metadataContainer">
          <h3 className="subHeader">Collection Metadata</h3>
          <p className="text">Name: {metadata.name}</p>
          <p className="text">Symbol: {metadata.symbol}</p>
          <p className="text">Floor Price: {metadata.floor_price} ETH</p>
          <img
            src={metadata.collection_logo}
            alt="Collection Logo"
            className="image"
          />
          <p>
            <a
              href={metadata.project_url}
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              Project Website
            </a>
          </p>
        </div>
      )}

      {historicalData && (
        <div className="chartContainer">
          <h3 className="subHeader">Floor Price History</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      text: "NFT Floor Price over Time",
      font: {
        size: 20,
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Time",
        color: "#888",
        font: {
          size: 16,
        },
      },
    },
    y: {
      title: {
        display: true,
        text: "Price (ETH)",
        color: "#888",
        font: {
          size: 16,
        },
      },
    },
  },
};

export default App;
